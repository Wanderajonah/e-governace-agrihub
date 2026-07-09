import Farmer from '../models/Farmer.js';
import Produce from '../models/Produce.js';
import Transaction from '../models/Transaction.js';
import CommodityPrice from '../models/CommodityPrice.js';

export const getCommodityTrends = async (period = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  const trends = await CommodityPrice.aggregate([
    {
      $match: {
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          commodity: '$commodity',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        },
        avgPrice: { $avg: '$price' },
        avgChange: { $avg: '$change' },
      },
    },
    {
      $sort: { '_id.date': 1 },
    },
    {
      $group: {
        _id: '$_id.commodity',
        data: {
          $push: {
            date: '$_id.date',
            price: { $round: ['$avgPrice', 2] },
            change: { $round: ['$avgChange', 2] },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        commodity: '$_id',
        data: 1,
      },
    },
    {
      $sort: { commodity: 1 },
    },
  ]);

  return trends;
};

export const getMonthlyTransactions = async (year) => {
  const targetYear = Number(year) || new Date().getFullYear();

  const transactions = await Transaction.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(`${targetYear}-01-01`),
          $lt: new Date(`${targetYear + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$date' },
        count: { $sum: 1 },
        totalValue: { $sum: '$total' },
        avgValue: { $avg: '$total' },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        _id: 0,
        month: '$_id',
        count: 1,
        totalValue: { $round: ['$totalValue', 2] },
        avgValue: { $round: ['$avgValue', 2] },
      },
    },
  ]);

  return transactions;
};

export const getRevenue = async (period = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  const revenue = await Transaction.aggregate([
    {
      $match: {
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' },
        },
        revenue: { $sum: '$total' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        revenue: { $round: ['$revenue', 2] },
        count: 1,
      },
    },
  ]);

  return revenue;
};

export const getMarketTurnover = async (from, to) => {
  const match = {};
  if (from || to) {
    match.date = {};
    if (from) {
      match.date.$gte = new Date(from);
    }
    if (to) {
      match.date.$lte = new Date(to);
    }
  }

  const turnover = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalValue: { $sum: '$total' },
        totalTransactions: { $sum: 1 },
        avgTransactionValue: { $avg: '$total' },
      },
    },
    {
      $project: {
        _id: 0,
        totalValue: { $round: ['$totalValue', 2] },
        totalTransactions: 1,
        avgTransactionValue: { $round: ['$avgTransactionValue', 2] },
      },
    },
  ]);

  return turnover.length > 0
    ? turnover[0]
    : { totalValue: 0, totalTransactions: 0, avgTransactionValue: 0 };
};

export const getProduceVolume = async () => {
  const volume = await Produce.aggregate([
    { $match: { isActive: { $ne: false } } },
    {
      $group: {
        _id: '$commodity',
        totalQuantity: { $sum: '$quantity' },
        unit: { $first: '$unit' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        commodity: '$_id',
        totalQuantity: { $round: ['$totalQuantity', 2] },
        unit: 1,
        count: 1,
      },
    },
    {
      $sort: { totalQuantity: -1 },
    },
  ]);

  return volume;
};

export const getPriceFluctuations = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const fluctuations = await CommodityPrice.aggregate([
    {
      $match: {
        date: { $gte: startDate },
      },
    },
    {
      $sort: { commodity: 1, date: 1 },
    },
    {
      $group: {
        _id: '$commodity',
        prices: { $push: { date: '$date', price: '$price' } },
        firstPrice: { $first: '$price' },
        lastPrice: { $last: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
        avgPrice: { $avg: '$price' },
      },
    },
    {
      $project: {
        _id: 0,
        commodity: '$_id',
        firstPrice: { $round: ['$firstPrice', 2] },
        lastPrice: { $round: ['$lastPrice', 2] },
        maxPrice: { $round: ['$maxPrice', 2] },
        minPrice: { $round: ['$minPrice', 2] },
        avgPrice: { $round: ['$avgPrice', 2] },
        changePercent: {
          $round: [
            {
              $cond: {
                if: { $gt: ['$firstPrice', 0] },
                then: {
                  $multiply: [
                    { $divide: [{ $subtract: ['$lastPrice', '$firstPrice'] }, '$firstPrice'] },
                    100,
                  ],
                },
                else: 0,
              },
            },
            2,
          ],
        },
        volatility: {
          $round: [
            {
              $cond: {
                if: { $gt: ['$avgPrice', 0] },
                then: {
                  $multiply: [
                    { $divide: [{ $subtract: ['$maxPrice', '$minPrice'] }, '$avgPrice'] },
                    100,
                  ],
                },
                else: 0,
              },
            },
            2,
          ],
        },
      },
    },
    {
      $sort: { commodity: 1 },
    },
  ]);

  return fluctuations;
};

export const getTopCommodities = async (limit = 10) => {
  const topCommodities = await Transaction.aggregate([
    {
      $group: {
        _id: '$commodity',
        totalValue: { $sum: '$total' },
        totalQuantity: { $sum: '$qtyNum' },
        transactionCount: { $sum: 1 },
      },
    },
    {
      $sort: { totalValue: -1 },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        _id: 0,
        commodity: '$_id',
        totalValue: { $round: ['$totalValue', 2] },
        totalQuantity: { $round: ['$totalQuantity', 2] },
        transactionCount: 1,
      },
    },
  ]);

  return topCommodities;
};

export const getTopDistricts = async (limit = 10) => {
  const topDistricts = await Farmer.aggregate([
    { $match: { isActive: { $ne: false } } },
    {
      $group: {
        _id: '$district',
        farmerCount: { $sum: 1 },
      },
    },
    {
      $sort: { farmerCount: -1 },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        _id: 0,
        district: '$_id',
        farmerCount: 1,
      },
    },
  ]);

  return topDistricts;
};

export const getRecentRegistrations = async (days = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const registrations = await Farmer.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        count: 1,
      },
    },
  ]);

  return registrations;
};
export default { getCommodityTrends, getMonthlyTransactions, getRevenue, getMarketTurnover, getProduceVolume, getPriceFluctuations, getTopCommodities, getTopDistricts, getRecentRegistrations };
