import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/index.js';

const signToken = (id, role) => {
  return jwt.sign({ id, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const register = async ({ name, email, password, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'Farmer',
    agency: 'Farmer',
    status: 'Active',
  });

  const token = signToken(user._id, user.role);
  user.password = undefined;

  return { user, token };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password +isActive');

  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive || user.status === 'Inactive') {
    const error = new Error('Your account has been deactivated');
    error.statusCode = 403;
    throw error;
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id, user.role);

  user.password = undefined;

  return { user, token };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!(await user.comparePassword(currentPassword))) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 401;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password changed successfully' };
};
export default { register, login, getCurrentUser, changePassword };
