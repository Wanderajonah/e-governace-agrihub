import { Router } from 'express';
import {
  getCommodityTrends,
  getMonthlyTransactions,
  getRevenue,
  getMarketTurnover,
  getProduceVolume,
  getPriceFluctuations,
  getTopCommodities,
  getTopDistricts,
  getRecentRegistrations,
} from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/commodity-trends', protect, getCommodityTrends);
router.get('/monthly-transactions', protect, getMonthlyTransactions);
router.get('/revenue', protect, getRevenue);
router.get('/market-turnover', protect, getMarketTurnover);
router.get('/produce-volume', protect, getProduceVolume);
router.get('/price-fluctuations', protect, getPriceFluctuations);
router.get('/top-commodities', protect, getTopCommodities);
router.get('/top-districts', protect, getTopDistricts);
router.get('/recent-registrations', protect, getRecentRegistrations);

export default router;
