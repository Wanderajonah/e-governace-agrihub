import CommodityPrice from '../models/CommodityPrice.js';
import { calculatePagination } from '../utils/helpers.js';

export const createPrice = async (data) => {
  const previousPrice = await CommodityPrice.findOne({ commodity: data.commodity })
    .sort({ date: -1 })
    .limit(1);

  let change = 0;
  if (previousPrice) {
    change = data.price - previousPrice.price;
  }

  const price = await CommodityPrice.create({ ...data, change });
  return price;
};

export const getPrice = async (id) => {
  const price = await CommodityPrice.findById(id);

  if (!price) {
    const error = new Error('Price record not found');
    error.statusCode = 404;
    throw error;
  }

  return price;
};

export const updatePrice = async (id, data) => {
  const price = await CommodityPrice.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!price) {
    const error = new Error('Price record not found');
    error.statusCode = 404;
    throw error;
  }

  return price;
};

export const deletePrice = async (id) => {
  const price = await CommodityPrice.findByIdAndDelete(id);

  if (!price) {
    const error = new Error('Price record not found');
    error.statusCode = 404;
    throw error;
  }

  return { message: 'Price record deleted successfully' };
};

export const listPrices = async (query) => {
  const { page, limit, search, grade, startDate, endDate, sort } = query;
  const { skip, limit: pageLimit, page: currentPage } = calculatePagination(page, limit);

  const filter = {};

  if (search) {
    filter.commodity = { $regex: search, $options: 'i' };
  }

  if (grade) {
    filter.grade = grade;
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

  const [prices, total] = await Promise.all([
    CommodityPrice.find(filter).sort(sortOption).skip(skip).limit(pageLimit),
    CommodityPrice.countDocuments(filter),
  ]);

  return {
    data: prices,
    total,
    page: currentPage,
    limit: pageLimit,
    pages: Math.ceil(total / pageLimit),
  };
};

export const getPriceTrends = async (commodity, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const trends = await CommodityPrice.aggregate([
    {
      $match: {
        commodity: { $regex: commodity, $options: 'i' },
        date: { $gte: startDate },
      },
    },
    {
      $sort: { date: 1 },
    },
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
        _id: 0,
        date: '$_id',
        price: { $round: ['$price', 2] },
        change: { $round: ['$change', 2] },
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  return trends;
};
export default { createPrice, getPrice, updatePrice, deletePrice, listPrices, getPriceTrends };
