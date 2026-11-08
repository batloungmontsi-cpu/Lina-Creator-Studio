import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const previousEmail = process.env.ADMIN_PREVIOUS_EMAIL?.trim().toLowerCase() || email;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password || password.length < 12 || password === 'replace-with-a-strong-password') {
  throw new Error('Set your actual ADMIN_EMAIL and a new ADMIN_PASSWORD of at least 12 characters in server/.env.');
}

try {
  await connectDatabase();
  const user = await User.findOne({ email: previousEmail });
  if (!user) throw new Error(`No creator account exists for ${previousEmail}.`);

  user.name = process.env.ADMIN_NAME?.trim() || user.name;
  user.email = email;
  user.passwordHash = await bcrypt.hash(password, 12);
  await user.save();
  console.log(`Creator password updated for ${email}.`);
} catch (error) {
  console.error('Could not reset the creator password:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
