import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resqone';
    const conn = await mongoose.connect(connUri);
    console.log(`[ResQOne] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('[ResQOne] Database connection error:', error);
    process.exit(1);
  }
};

