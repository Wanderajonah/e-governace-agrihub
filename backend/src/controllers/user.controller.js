const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { calculatePagination } = require('../utils/helpers');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

const createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  user.password = undefined;
  return successResponse(res, user, 'User created successfully', 201);
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return successResponse(res, user);
});

const updateUser = asyncHandler(async (req, res) => {
  if (req.body.password) {
    const err = new Error('Password cannot be updated through this endpoint');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return successResponse(res, user, 'User updated successfully');
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  user.isActive = false;
  user.status = 'Inactive';
  await user.save();

  return successResponse(res, { message: 'User deleted successfully' }, 'User deleted successfully');
});

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, role, status, sort } = req.query;
  const { skip, limit: pageLimit, page: currentPage } = calculatePagination(page, limit);

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (role) filter.role = role;
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

  const [users, total] = await Promise.all([
    User.find(filter).sort(sortOption).skip(skip).limit(pageLimit),
    User.countDocuments(filter),
  ]);

  return paginatedResponse(res, users, total, currentPage, pageLimit);
});

module.exports = { createUser, getUser, updateUser, deleteUser, listUsers };
