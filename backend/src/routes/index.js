import authRoutes from './auth.routes.js';
import farmerRoutes from './farmer.routes.js';
import produceRoutes from './produce.routes.js';
import priceRoutes from './price.routes.js';
import verificationRoutes from './verification.routes.js';
import transactionRoutes from './transaction.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import analyticsRoutes from './analytics.routes.js';
import reportRoutes from './report.routes.js';
import notificationRoutes from './notification.routes.js';
import userRoutes from './user.routes.js';

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

export default mountRoutes;
