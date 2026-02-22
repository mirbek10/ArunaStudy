import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 5000),
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_dev_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI:
    process.env.MONGODB_URI ||
    'mongodb+srv://mirbekbook_db_user:261008wyqppi@cluster0.hyiicfp.mongodb.net/?appName=Cluster0',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'arunastudy',
  MONGODB_COLLECTION: process.env.MONGODB_COLLECTION || 'app_state'
};
