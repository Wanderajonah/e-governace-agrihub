const asyncHandler = require('express-async-handler');
const ProduceVerification = require('../models/ProduceVerification');
const Produce = require('../models/Produce');
const { calculatePagination } = require('../utils/helpers');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

const createVerification = asyncHandler(async (req, res) => {
  const verification = await ProduceVerification.create(req.body);

  await Produce.findByIdAndUpdate(req.body.produce, { status: 'Under Review' });

  return successResponse(res, verification, 'Verification created successfully', 201);
});

const approveVerification = asyncHandler(async (req, res) => {
  const data = { ...req.body, inspectedBy: req.user._id };
  const verification = await ProduceVerification.findByIdAndUpdate(
    req.params.id,
    { ...data, status: 'Approved', inspectedAt: new Date() },
    { new: true, runValidators: true }
  );

  if (!verification) {
    const err = new Error('Verification record not found');
    err.statusCode = 404;
    throw err;
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

  return successResponse(res, verification, 'Verification approved successfully');
});

const rejectVerification = asyncHandler(async (req, res) => {
  const data = { ...req.body, inspectedBy: req.user._id };
  const verification = await ProduceVerification.findByIdAndUpdate(
    req.params.id,
    { ...data, status: 'Rejected', inspectedAt: new Date() },
    { new: true, runValidators: true }
  );

  if (!verification) {
    const err = new Error('Verification record not found');
    err.statusCode = 404;
    throw err;
  }

  await Produce.findByIdAndUpdate(verification.produce, {
    status: 'Pending',
    inspectorComments: data.inspectorComments || verification.inspectorComments,
    inspectorName: data.inspectorName || verification.inspectorName,
  });

  return successResponse(res, verification, 'Verification rejected successfully');
});

const getVerification = asyncHandler(async (req, res) => {
  const verification = await ProduceVerification.findById(req.params.id)
    .populate('produce')
    .populate('farmer');

  if (!verification) {
    const err = new Error('Verification record not found');
    err.statusCode = 404;
    throw err;
  }

  return successResponse(res, verification);
});

const listVerifications = asyncHandler(async (req, res) => {
  const { page, limit, search, status, sort } = req.query;
  const { skip, limit: pageLimit, page: currentPage } = calculatePagination(page, limit);

  const filter = {};

  if (search) {
    filter.$or = [
      { verificationId: { $regex: search, $options: 'i' } },
      { farmerName: { $regex: search, $options: 'i' } },
      { commodity: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) filter.status = status;

  let sortOption = { createdAt: -1 };
  if (sort) {
    const sortFields = sort.split(',').reduce((acc, field) => {
      if (field.startsWith('-')) acc[field.substring(1)] = -1;
      else acc[field] = 1;
      return acc;
    }, {});
    sortOption = sortFields;
  }

  const [verifications, total] = await Promise.all([
    ProduceVerification.find(filter)
      .populate('produce').populate('farmer')
      .sort(sortOption).skip(skip).limit(pageLimit),
    ProduceVerification.countDocuments(filter),
  ]);

  return paginatedResponse(res, verifications, total, currentPage, pageLimit);
});

module.exports = { createVerification, approveVerification, rejectVerification, getVerification, listVerifications };
