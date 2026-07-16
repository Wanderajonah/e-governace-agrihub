const asyncHandler = require('express-async-handler');
const Farmer = require('../models/Farmer');
const { calculatePagination } = require('../utils/helpers');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

const createFarmer = asyncHandler(async (req, res) => {
  const farmerId = await Farmer.generateFarmerId();
  const farmer = await Farmer.create({ ...req.body, farmerId });
  return successResponse(res, farmer, 'Farmer created successfully', 201);
});

const getFarmer = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({
    $or: [{ _id: req.params.id }, { farmerId: req.params.id }],
  });

  if (!farmer) {
    const err = new Error('Farmer not found');
    err.statusCode = 404;
    throw err;
  }

  return successResponse(res, farmer);
});

const updateFarmer = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!farmer) {
    const err = new Error('Farmer not found');
    err.statusCode = 404;
    throw err;
  }

  return successResponse(res, farmer, 'Farmer updated successfully');
});

const deleteFarmer = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findById(req.params.id);

  if (!farmer) {
    const err = new Error('Farmer not found');
    err.statusCode = 404;
    throw err;
  }

  farmer.isActive = false;
  await farmer.save();

  return successResponse(res, { message: 'Farmer deleted successfully' }, 'Farmer deleted successfully');
});

const listFarmers = asyncHandler(async (req, res) => {
  const { page, limit, search, district, status, sort } = req.query;
  const { skip, limit: pageLimit, page: currentPage } = calculatePagination(page, limit);

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { farmerId: { $regex: search, $options: 'i' } },
    ];
  }

  if (district) filter.district = district;
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

  const [farmers, total] = await Promise.all([
    Farmer.find(filter).sort(sortOption).skip(skip).limit(pageLimit),
    Farmer.countDocuments(filter),
  ]);

  return paginatedResponse(res, farmers, total, currentPage, pageLimit);
});

module.exports = { createFarmer, getFarmer, updateFarmer, deleteFarmer, listFarmers };
