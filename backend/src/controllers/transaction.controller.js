import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import transactionService from '../services/transaction.service.js';

export const createTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.createTransaction(req.body);
    return successResponse(res, transaction, 'Transaction created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransaction(req.params.id);
    return successResponse(res, transaction);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const listTransactions = async (req, res, next) => {
  try {
    const { data, total, page, limit } = await transactionService.listTransactions(req.query);
    return paginatedResponse(res, data, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};
