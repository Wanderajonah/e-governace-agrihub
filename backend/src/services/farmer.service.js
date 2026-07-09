import Farmer from '../models/Farmer.js';
import { calculatePagination } from '../utils/helpers.js';

export const createFarmer = async (data) => {
  const farmerId = await Farmer.generateFarmerId();
  const farmer = await Farmer.create({ ...data, farmerId });
  return farmer;
};

export const getFarmer = async (id) => {
  const farmer = await Farmer.findOne({
    $or: [{ _id: id }, { farmerId: id }],
  });

  if (!farmer) {
    const error = new Error('Farmer not found');
    error.statusCode = 404;
    throw error;
  }

  return farmer;
};

export const updateFarmer = async (id, data) => {
  const farmer = await Farmer.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!farmer) {
    const error = new Error('Farmer not found');
    error.statusCode = 404;
    throw error;
  }

  return farmer;
};

export const deleteFarmer = async (id) => {
  const farmer = await Farmer.findById(id);

  if (!farmer) {
    const error = new Error('Farmer not found');
    error.statusCode = 404;
    throw error;
  }

  farmer.isActive = false;
  await farmer.save();

  return { message: 'Farmer deleted successfully' };
};

export const listFarmers = async (query) => {
  const { page, limit, search, district, status, sort } = query;
  const { skip, limit: pageLimit, page: currentPage } = calculatePagination(page, limit);

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { farmerId: { $regex: search, $options: 'i' } },
    ];
  }

  if (district) {
    filter.district = district;
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

  const [farmers, total] = await Promise.all([
    Farmer.find(filter).sort(sortOption).skip(skip).limit(pageLimit),
    Farmer.countDocuments(filter),
  ]);

  return {
    data: farmers,
    total,
    page: currentPage,
    limit: pageLimit,
    pages: Math.ceil(total / pageLimit),
  };
};
export default { createFarmer, getFarmer, updateFarmer, deleteFarmer, listFarmers };
