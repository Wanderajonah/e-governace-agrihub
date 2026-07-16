const { Router } = require('express');
const { getCommodityTrends, getMonthlyTransactions, getRevenue, getMarketTurnover, getProduceVolume, getPriceFluctuations, getTopCommodities, getTopDistricts, getRecentRegistrations } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth');

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

module.exports = router;
