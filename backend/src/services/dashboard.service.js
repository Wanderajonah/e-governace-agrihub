import mongoose from 'mongoose';
import Farmer from '../models/Farmer.js';
import Produce from '../models/Produce.js';
import Transaction from '../models/Transaction.js';
import CommodityPrice from '../models/CommodityPrice.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

export const getStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalFarmers,
    registeredProduce,
    verifiedProduce,
    pendingVerification,
    todayTransactionsResult,
    monthlyRevenue,
    avgPrices,
    recentActivities,
    unreadNotifications,
  ] = await Promise.all([
    Farmer.countDocuments(),
    Produce.countDocuments(),
    Produce.countDocuments({ status: 'Verified' }),
    Produce.countDocuments({ status: 'Pending' }),
    Transaction.aggregate([
      {
        $match: {
          date: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          value: { $sum: '$total' },
        },
      },
    ]),
    Transaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          revenue: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 },
      },
      {
        $limit: 12,
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          revenue: { $round: ['$revenue', 2] },
          count: 1,
        },
      },
    ]),
    CommodityPrice.aggregate([
      {
        $group: {
          _id: '$commodity',
          avgPrice: { $avg: '$price' },
          lastPrice: { $last: '$price' },
          unit: { $first: '$unit' },
        },
      },
      {
        $project: {
          _id: 0,
          commodity: '$_id',
          avgPrice: { $round: ['$avgPrice', 2] },
          lastPrice: { $round: ['$lastPrice', 2] },
          unit: 1,
        },
      },
      {
        $sort: { commodity: 1 },
      },
    ]),
    AuditLog.find().sort({ createdAt: -1 }).limit(10),
    Notification.countDocuments({
      $or: [{ read: false, user: null }, { read: false }],
    }),
  ]);

  const todayTransactions = todayTransactionsResult.length > 0
    ? todayTransactionsResult[0]
    : { count: 0, value: 0 };

  return {
    totalFarmers,
    registeredProduce,
    verifiedProduce,
    pendingVerification,
    todayTransactions: {
      count: todayTransactions.count,
      value: Math.round(todayTransactions.value * 100) / 100,
    },
    marketValue: Math.round(todayTransactions.value * 100) / 100,
    monthlyRevenue,
    avgPrices,
    recentActivities,
    unreadNotifications,
  };
};
export default { getStats };
