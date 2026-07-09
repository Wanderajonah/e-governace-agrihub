import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import userService from '../services/user.service.js';

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return successResponse(res, user, 'User created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUser(req.params.id);
    return successResponse(res, user);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return successResponse(res, user, 'User updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    return successResponse(res, result, 'User deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const { data, total, page, limit } = await userService.listUsers(req.query);
    return paginatedResponse(res, data, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};
