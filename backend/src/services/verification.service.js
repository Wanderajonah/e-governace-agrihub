import ProduceVerification from '../models/ProduceVerification.js';
import Produce from '../models/Produce.js';
import { calculatePagination } from '../utils/helpers.js';

export const createVerification = async (data) => {
  const verification = await ProduceVerification.create(data);

  await Produce.findByIdAndUpdate(data.produce, { status: 'Under Review' });

  return verification;
};

export const approveVerification = async (id, data) => {
  const verification = await ProduceVerification.findByIdAndUpdate(
    id,
    {
      ...data,
      status: 'Approved',
      inspectedAt: new Date(),
    },
    { new: true, runValidators: true }
  );

  if (!verification) {
    const error = new Error('Verification record not found');
    error.statusCode = 404;
    throw error;
  }

  await Produce.findByIdAndUpdate(verification.produce, {
    status: 'Verified',
    grade: data.grade || verification.grade,
    qualityStatus: data.qualityStatus || verification.qualityStatus,
    moistureContent: data.moistureContent || verification.moistureContent,
    inspectorComments: data.inspectorComments || verification.inspectorComments,
    inspectorName: data.inspectorName || verification.inspectorName,
    verifiedAt: new Date(),
    verifiedBy: data.inspectedBy || verification.inspectedBy,
  });

  return verification;
};

export const rejectVerification = async (id, data) => {
  const verification = await ProduceVerification.findByIdAndUpdate(
    id,
    {
      ...data,
      status: 'Rejected',
      inspectedAt: new Date(),
    },
    { new: true, runValidators: true }
  );

  if (!verification) {
    const error = new Error('Verification record not found');
    error.statusCode = 404;
    throw error;
  }

  await Produce.findByIdAndUpdate(verification.produce, {
    status: 'Pending',
    inspectorComments: data.inspectorComments || verification.inspectorComments,
    inspectorName: data.inspectorName || verification.inspectorName,
  });

  return verification;
};

export const getVerification = async (id) => {
  const verification = await ProduceVerification.findById(id)
    .populate('produce')
    .populate('farmer');

  if (!verification) {
    const error = new Error('Verification record not found');
    error.statusCode = 404;
    throw error;
  }

  return verification;
};

export const listVerifications = async (query) => {
  const { page, limit, search, status, sort } = query;
  const { skip, limit: pageLimit, page: currentPage } = calculatePagination(page, limit);

  const filter = {};

  if (search) {
    filter.$or = [
      { verificationId: { $regex: search, $options: 'i' } },
      { farmerName: { $regex: search, $options: 'i' } },
      { commodity: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  let sortOption = { createdAt: -1 };
  if (sort) {
    const sortFields = sort.split(',').reduce((acc, field) => {
      if (field.startsWith('-')) {
        acc[field.substring(1)] = -1;
      } else {
        acc[field] = 1;
      }
      return acc;
    }, {});
    sortOption = sortFields;
  }

  const [verifications, total] = await Promise.all([
    ProduceVerification.find(filter)
      .populate('produce')
      .populate('farmer')
      .sort(sortOption)
      .skip(skip)
      .limit(pageLimit),
    ProduceVerification.countDocuments(filter),
  ]);

  return {
    data: verifications,
    total,
    page: currentPage,
    limit: pageLimit,
    pages: Math.ceil(total / pageLimit),
  };
};
export default { createVerification, approveVerification, rejectVerification, getVerification, listVerifications };
