const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const { calculatePagination } = require('../utils/helpers');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

const createTransaction = asyncHandler(async (req, res) => {
  const total = req.body.qtyNum * req.body.unitPrice;
  const transaction = await Transaction.create({ ...req.body, total });
  return successResponse(res, transaction, 'Transaction created successfully', 201);
});

const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    $or: [{ _id: req.params.id }, { transactionId: req.params.id }],
  });

  if (!transaction) {
    const err = new Error('Transaction not found');
    err.statusCode = 404;
    throw err;
  }

  return successResponse(res, transaction);
});

const listTransactions = asyncHandler(async (req, res) => {
  const { page, limit, search, payment, startDate, endDate, sort } = req.query;
  const { skip, limit: pageLimit, page: currentPage } = calculatePagination(page, limit);

  const filter = {};

  if (search) {
    filter.$or = [
      { transactionId: { $regex: search, $options: 'i' } },
      { buyer: { $regex: search, $options: 'i' } },
      { seller: { $regex: search, $options: 'i' } },
      { commodity: { $regex: search, $options: 'i' } },
      { receiptNumber: { $regex: search, $options: 'i' } },
    ];
  }

  if (payment) filter.payment = payment;

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

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort(sortOption).skip(skip).limit(pageLimit),
    Transaction.countDocuments(filter),
  ]);

  return paginatedResponse(res, transactions, total, currentPage, pageLimit);
});

module.exports = { createTransaction, getTransaction, listTransactions };
