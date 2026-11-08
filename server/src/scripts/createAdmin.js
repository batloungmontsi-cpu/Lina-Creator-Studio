import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';

const name = process.env.ADMIN_NAME?.trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!name || !email || !password || password.length < 12 || password === 'replace-with-a-strong-password') {
  throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 12 characters in server/.env.');
}

try {
  await connectDatabase();
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error(`A creator account already exists for ${email}.`);

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ name, email, passwordHash });
  console.log(`Creator account created for ${email}.`);
} catch (error) {
  console.error('Could not create the creator account:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
