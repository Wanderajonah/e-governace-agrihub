import Produce from '../models/Produce.js';
import { calculatePagination } from '../utils/helpers.js';

export const registerProduce = async (data) => {
  const produceId = await Produce.generateProduceId();
  const produce = await Produce.create({ ...data, produceId });
  return produce;
};

export const getProduce = async (id) => {
  const produce = await Produce.findOne({
    $or: [{ _id: id }, { produceId: id }],
  }).populate('farmer');

  if (!produce) {
    const error = new Error('Produce not found');
    error.statusCode = 404;
    throw error;
  }

  return produce;
};

export const updateProduce = async (id, data) => {
  const produce = await Produce.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!produce) {
    const error = new Error('Produce not found');
    error.statusCode = 404;
    throw error;
  }

  return produce;
};

export const deleteProduce = async (id) => {
  const produce = await Produce.findById(id);

  if (!produce) {
    const error = new Error('Produce not found');
    error.statusCode = 404;
    throw error;
  }

  produce.isActive = false;
  await produce.save();

  return { message: 'Produce deleted successfully' };
};

export const listProduce = async (query) => {
  const { page, limit, search, commodity, sourceDistrict, status, sort } = query;
  const { skip, limit: pageLimit, page: currentPage } = calculatePagination(page, limit);

  const filter = {};

  if (search) {
    filter.$or = [
      { produceId: { $regex: search, $options: 'i' } },
      { commodity: { $regex: search, $options: 'i' } },
      { farmerName: { $regex: search, $options: 'i' } },
    ];
  }

  if (commodity) {
    filter.commodity = commodity;
  }

  if (sourceDistrict) {
    filter.sourceDistrict = sourceDistrict;
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

  const [produce, total] = await Promise.all([
    Produce.find(filter).populate('farmer').sort(sortOption).skip(skip).limit(pageLimit),
    Produce.countDocuments(filter),
  ]);

  return {
    data: produce,
    total,
    page: currentPage,
    limit: pageLimit,
    pages: Math.ceil(total / pageLimit),
  };
};
export default { registerProduce, getProduce, updateProduce, deleteProduce, listProduce };
