const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const config = require('../config/index');
const { successResponse } = require('../utils/apiResponse');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, district } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({
    name, email, password, phone,
    role: 'Farmer', agency: 'Farmer', status: 'Active',
  });

  await Farmer.create({
    name, phone,
    district: district || 'Kampala',
    produce: '', status: 'Active',
  });

  const token = signToken(user._id, user.role);
  user.password = undefined;

  return successResponse(res, { user, token }, 'Registration successful', 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password +isActive');

  if (!user || !(await user.comparePassword(password))) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive || user.status === 'Inactive') {
    const err = new Error('Your account has been deactivated');
    err.statusCode = 403;
    throw err;
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id, user.role);
  user.password = undefined;

  return successResponse(res, { user, token }, 'Login successful');
});

const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, req.user);
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (!(await user.comparePassword(currentPassword))) {
    const err = new Error('Current password is incorrect');
    err.statusCode = 401;
    throw err;
  }

  user.password = newPassword;
  await user.save();

  return successResponse(res, { message: 'Password changed successfully' }, 'Password changed successfully');
});

module.exports = { register, login, getMe, changePassword };
