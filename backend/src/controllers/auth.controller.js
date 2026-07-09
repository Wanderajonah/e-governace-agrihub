import { successResponse, errorResponse } from '../utils/apiResponse.js';
import authService from '../services/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    return successResponse(res, { user, token }, 'Registration successful', 201);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    return successResponse(res, { user, token }, 'Login successful');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return successResponse(res, req.user);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
    return successResponse(res, result, 'Password changed successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};
