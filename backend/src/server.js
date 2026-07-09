import app from './app.js';
import config from './config/index.js';
import connectDB from './config/db.js';

const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});
