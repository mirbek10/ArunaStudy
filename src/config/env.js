import dotenv from 'dotenv';

dotenv.config();

function toPositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  PORT: toPositiveNumber(process.env.PORT, 5100),
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_dev_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI:
    process.env.MONGODB_URI ||
    'mongodb+srv://mirbekbook_db_user:261008wyqppi@cluster0.hyiicfp.mongodb.net/?appName=Cluster0',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'arunastudy',
  MONGODB_COLLECTION: process.env.MONGODB_COLLECTION || 'app_state',
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: toPositiveNumber(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS, 10000),
  MONGODB_RETRY_DELAY_MS: toPositiveNumber(process.env.MONGODB_RETRY_DELAY_MS, 15000)
};
