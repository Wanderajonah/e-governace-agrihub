const authRoutes = require('./auth.routes');
const farmerRoutes = require('./farmer.routes');
const produceRoutes = require('./produce.routes');
const priceRoutes = require('./price.routes');
const verificationRoutes = require('./verification.routes');
const transactionRoutes = require('./transaction.routes');
const dashboardRoutes = require('./dashboard.routes');
const analyticsRoutes = require('./analytics.routes');
const reportRoutes = require('./report.routes');
const notificationRoutes = require('./notification.routes');
const userRoutes = require('./user.routes');

const mountRoutes = (app) => {
  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/farmers', farmerRoutes);
  app.use('/api/produce', produceRoutes);
  app.use('/api/prices', priceRoutes);
  app.use('/api/verifications', verificationRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/users', userRoutes);
};

module.exports = mountRoutes;
