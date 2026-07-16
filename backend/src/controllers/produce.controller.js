const asyncHandler = require('express-async-handler');
const Produce = require('../models/Produce');
const { calculatePagination } = require('../utils/helpers');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

const buildListFilter = (query) => {
  const { search, commodity, sourceDistrict, status, sort, farmerId } = query;
  const filter = {};

  if (farmerId) filter.farmer = farmerId;

  if (search) {
    filter.$or = [
      { produceId: { $regex: search, $options: 'i' } },
      { commodity: { $regex: search, $options: 'i' } },
      { farmerName: { $regex: search, $options: 'i' } },
    ];
  }

  if (commodity) filter.commodity = commodity;
  if (sourceDistrict) filter.sourceDistrict = sourceDistrict;
  if (status) filter.status = status;

  return { filter, sort };
};

const registerProduce = asyncHandler(async (req, res) => {
  const data = req.user.role === 'Farmer'
    ? { ...req.body, farmer: req.user._id, farmerName: req.user.name }
    : req.body;
  const produceId = await Produce.generateProduceId();
  const produce = await Produce.create({ ...data, produceId });
  return successResponse(res, produce, 'Produce registered successfully', 201);
});

const listMyProduce = asyncHandler(async (req, res) => {
  const { search, commodity, sourceDistrict, status, sort } = req.query;
  const { skip, limit: pageLimit, page: currentPage } = calculatePagination(req.query.page, req.query.limit);

  const { filter } = buildListFilter({ search, commodity, sourceDistrict, status, sort, farmerId: req.user._id });

  let sortOption = { createdAt: -1 };
  if (sort) {
    const sortFields = sort.split(',').reduce((acc, field) => {
      if (field.startsWith('-')) acc[field.substring(1)] = -1;
      else acc[field] = 1;
      return acc;
    }, {});
    sortOption = sortFields;
  }

  const [produce, total] = await Promise.all([
    Produce.find(filter).populate('farmer').sort(sortOption).skip(skip).limit(pageLimit),
    Produce.countDocuments(filter),
  ]);

  return paginatedResponse(res, produce, total, currentPage, pageLimit);
});

const getProduce = asyncHandler(async (req, res) => {
  const produce = await Produce.findOne({
    $or: [{ _id: req.params.id }, { produceId: req.params.id }],
  }).populate('farmer');

  if (!produce) {
    const err = new Error('Produce not found');
    err.statusCode = 404;
    throw err;
  }

  return successResponse(res, produce);
});

const updateProduce = asyncHandler(async (req, res) => {
  const produce = await Produce.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!produce) {
    const err = new Error('Produce not found');
    err.statusCode = 404;
    throw err;
  }

  return successResponse(res, produce, 'Produce updated successfully');
});

const deleteProduce = asyncHandler(async (req, res) => {
  const produce = await Produce.findById(req.params.id);

  if (!produce) {
    const err = new Error('Produce not found');
    err.statusCode = 404;
    throw err;
  }

  produce.isActive = false;
  await produce.save();

  return successResponse(res, { message: 'Produce deleted successfully' }, 'Produce deleted successfully');
});

const listProduce = asyncHandler(async (req, res) => {
  const { page, limit, search, commodity, sourceDistrict, status, sort, farmerId } = req.query;
  const { skip, limit: pageLimit, page: currentPage } = calculatePagination(page, limit);

  const { filter } = buildListFilter({ search, commodity, sourceDistrict, status, sort, farmerId });

  let sortOption = { createdAt: -1 };
  if (sort) {
    const sortFields = sort.split(',').reduce((acc, field) => {
      if (field.startsWith('-')) acc[field.substring(1)] = -1;
      else acc[field] = 1;
      return acc;
    }, {});
    sortOption = sortFields;
  }

  const [produce, total] = await Promise.all([
    Produce.find(filter).populate('farmer').sort(sortOption).skip(skip).limit(pageLimit),
    Produce.countDocuments(filter),
  ]);

  return paginatedResponse(res, produce, total, currentPage, pageLimit);
});

module.exports = { registerProduce, listMyProduce, getProduce, updateProduce, deleteProduce, listProduce };
