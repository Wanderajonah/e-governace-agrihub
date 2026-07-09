import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/agrihub',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;
