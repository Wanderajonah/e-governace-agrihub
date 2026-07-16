const asyncHandler = require('express-async-handler');
const CommodityPrice = require('../models/CommodityPrice');
const { calculatePagination } = require('../utils/helpers');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

const createPrice = asyncHandler(async (req, res) => {
  const previousPrice = await CommodityPrice.findOne({ commodity: req.body.commodity })
    .sort({ date: -1 })
    .limit(1);

  let change = 0;
  if (previousPrice) {
    change = req.body.price - previousPrice.price;
  }

  const price = await CommodityPrice.create({ ...req.body, change });
  return successResponse(res, price, 'Price created successfully', 201);
});

const getPrice = asyncHandler(async (req, res) => {
  const price = await CommodityPrice.findById(req.params.id);

  if (!price) {
    const err = new Error('Price record not found');
    err.statusCode = 404;
    throw err;
  }

  return successResponse(res, price);
});

const updatePrice = asyncHandler(async (req, res) => {
  const price = await CommodityPrice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!price) {
    const err = new Error('Price record not found');
    err.statusCode = 404;
    throw err;
  }

  return successResponse(res, price, 'Price updated successfully');
});

const deletePrice = asyncHandler(async (req, res) => {
  const price = await CommodityPrice.findByIdAndDelete(req.params.id);

  if (!price) {
    const err = new Error('Price record not found');
    err.statusCode = 404;
    throw err;
  }

  return successResponse(res, { message: 'Price record deleted successfully' }, 'Price record deleted successfully');
});

const listPrices = asyncHandler(async (req, res) => {
  const { page, limit, search, grade, startDate, endDate, sort } = req.query;
  const { skip, limit: pageLimit, page: currentPage } = calculatePagination(page, limit);

  const filter = {};

  if (search) filter.commodity = { $regex: search, $options: 'i' };
  if (grade) filter.grade = grade;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  let sortOption = { date: -1 };
  if (sort) {
    const sortFields = sort.split(',').reduce((acc, field) => {
      if (field.startsWith('-')) acc[field.substring(1)] = -1;
      else acc[field] = 1;
      return acc;
    }, {});
    sortOption = sortFields;
  }

  const [prices, total] = await Promise.all([
    CommodityPrice.find(filter).sort(sortOption).skip(skip).limit(pageLimit),
    CommodityPrice.countDocuments(filter),
  ]);

  return paginatedResponse(res, prices, total, currentPage, pageLimit);
});

const getPriceTrends = asyncHandler(async (req, res) => {
  const commodity = req.query.commodity;
  const days = req.query.days || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const trends = await CommodityPrice.aggregate([
    {
      $match: {
        commodity: { $regex: commodity, $options: 'i' },
        date: { $gte: startDate },
      },
    },
    { $sort: { date: 1 } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        price: { $avg: '$price' },
        change: { $avg: '$change' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0, date: '$_id',
        price: { $round: ['$price', 2] },
        change: { $round: ['$change', 2] },
      },
    },
    { $sort: { date: 1 } },
  ]);

  return successResponse(res, trends, 'Price trends retrieved successfully');
});

module.exports = { createPrice, getPrice, updatePrice, deletePrice, listPrices, getPriceTrends };
