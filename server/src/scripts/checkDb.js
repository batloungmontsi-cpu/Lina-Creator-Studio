import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';

try {
  await connectDatabase();
  console.log('Database credentials are valid.');
} catch (error) {
  console.error('Database connection failed:', error.message);
  if (/bad auth|authentication failed/i.test(error.message)) {
    console.error(
      'Reset the database user password in Atlas (Database Access), then update DB_PASSWORD in server/.env.',
    );
  }
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
