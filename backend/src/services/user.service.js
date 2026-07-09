import User from '../models/User.js';
import { calculatePagination } from '../utils/helpers.js';

export const createUser = async (data) => {
  const user = await User.create(data);
  user.password = undefined;
  return user;
};

export const getUser = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const updateUser = async (id, data) => {
  if (data.password) {
    const error = new Error('Password cannot be updated through this endpoint');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const deleteUser = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.isActive = false;
  user.status = 'Inactive';
  await user.save();

  return { message: 'User deleted successfully' };
};

export const listUsers = async (query) => {
  const { page, limit, search, role, status, sort } = query;
  const { skip, limit: pageLimit, page: currentPage } = calculatePagination(page, limit);

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (role) {
    filter.role = role;
  }

  if (status) {
    filter.status = status;
  }

  let sortOption = { createdAt: -1 };
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

  const [users, total] = await Promise.all([
    User.find(filter).sort(sortOption).skip(skip).limit(pageLimit),
    User.countDocuments(filter),
  ]);

  return {
    data: users,
    total,
    page: currentPage,
    limit: pageLimit,
    pages: Math.ceil(total / pageLimit),
  };
};
export default { createUser, getUser, updateUser, deleteUser, listUsers };
