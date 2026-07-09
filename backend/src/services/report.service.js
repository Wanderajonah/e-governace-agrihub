import Report from '../models/Report.js';
import Farmer from '../models/Farmer.js';
import Produce from '../models/Produce.js';
import Transaction from '../models/Transaction.js';
import CommodityPrice from '../models/CommodityPrice.js';
import { calculatePagination } from '../utils/helpers.js';

const getDateRangeForPeriod = (period) => {
  const now = new Date();
  let start, end;

  switch (period) {
    case 'daily': {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start);
      end.setDate(end.getDate() + 1);
      break;
    }
    case 'weekly': {
      const dayOfWeek = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      end = new Date(start);
      end.setDate(end.getDate() + 7);
      break;
    }
    case 'monthly': {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    }
    case 'annual': {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear() + 1, 0, 1);
      break;
    }
    default: {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start);
      end.setDate(end.getDate() + 1);
    }
  }

  return { start, end };
};

const generateReportData = async (type, period) => {
  const { start, end } = period
    ? { start: new Date(period), end: new Date(period) }
    : getDateRangeForPeriod(type);

  if (!period) {
    const range = getDateRangeForPeriod(type);
    start.setTime(range.start.getTime());
    end.setTime(range.end.getTime());
  }

  const [
    totalFarmers,
    newFarmers,
    totalProduce,
    verifiedProduce,
    pendingVerification,
    transactionData,
    priceData,
  ] = await Promise.all([
    Farmer.countDocuments(),
    Farmer.countDocuments({ createdAt: { $gte: start, $lt: end } }),
    Produce.countDocuments(),
    Produce.countDocuments({ status: 'Verified' }),
    Produce.countDocuments({ status: 'Pending' }),
    Transaction.aggregate([
      {
        $match: {
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgTransactionValue: { $avg: '$total' },
        },
      },
    ]),
    CommodityPrice.aggregate([
      {
        $match: {
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: '$commodity',
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]),
  ]);

  const transactions = transactionData.length > 0
    ? transactionData[0]
    : { totalTransactions: 0, totalRevenue: 0, avgTransactionValue: 0 };

  const title = `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${start.toLocaleDateString()}`;

  return {
    period: {
      start,
      end: end || start,
      label: period || type,
    },
    summary: {
      totalFarmers,
      newFarmers,
      totalProduce,
      verifiedProduce,
      pendingVerification,
      totalTransactions: transactions.totalTransactions,
      totalRevenue: Math.round(transactions.totalRevenue * 100) / 100,
      avgTransactionValue: Math.round(transactions.avgTransactionValue * 100) / 100,
    },
    transactions,
    priceData: priceData.map((p) => ({
      commodity: p._id,
      avgPrice: Math.round(p.avgPrice * 100) / 100,
      minPrice: Math.round(p.minPrice * 100) / 100,
      maxPrice: Math.round(p.maxPrice * 100) / 100,
    })),
    generatedAt: new Date(),
  };
};

export const generateReport = async (type, period, generatedBy) => {
  const reportData = await generateReportData(type, period);

  const title = `${type.charAt(0).toUpperCase() + type.slice(1)} Report`;

  const report = await Report.create({
    type,
    title,
    period: reportData.period.label || period,
    data: reportData,
    generatedBy,
    format: 'PDF',
    dateRange: {
      start: reportData.period.start,
      end: reportData.period.end || reportData.period.start,
    },
  });

  return report;
};

export const getReport = async (id) => {
  const report = await Report.findById(id).populate('generatedBy', 'name email');

  if (!report) {
    const error = new Error('Report not found');
    error.statusCode = 404;
    throw error;
  }

  return report;
};

export const listReports = async (query) => {
  const { page, limit, type, sort } = query;
  const { skip, limit: pageLimit, page: currentPage } = calculatePagination(page, limit);

  const filter = {};
  if (type) {
    filter.type = type;
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

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('generatedBy', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(pageLimit),
    Report.countDocuments(filter),
  ]);

  return {
    data: reports,
    total,
    page: currentPage,
    limit: pageLimit,
    pages: Math.ceil(total / pageLimit),
  };
};
export default { generateReport, getReport, listReports };
