import Transaction from '../models/Transaction.js';
import { calculatePagination } from '../utils/helpers.js';

export const createTransaction = async (data) => {
  const total = data.qtyNum * data.unitPrice;

  const transaction = await Transaction.create({ ...data, total });
  return transaction;
};

export const getTransaction = async (id) => {
  const transaction = await Transaction.findOne({
    $or: [{ _id: id }, { transactionId: id }],
  });

  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

export const listTransactions = async (query) => {
  const { page, limit, search, payment, startDate, endDate, sort } = query;
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

  if (payment) {
    filter.payment = payment;
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      filter.date.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.date.$lte = new Date(endDate);
    }
  }

  let sortOption = { date: -1 };
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

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort(sortOption).skip(skip).limit(pageLimit),
    Transaction.countDocuments(filter),
  ]);

  return {
    data: transactions,
    total,
    page: currentPage,
    limit: pageLimit,
    pages: Math.ceil(total / pageLimit),
  };
};
export default { createTransaction, getTransaction, listTransactions };
