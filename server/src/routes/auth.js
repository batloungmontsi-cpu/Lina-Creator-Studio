import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
});

router.post('/login', loginLimiter, async (request, response) => {
  const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : '';
  const password = typeof request.body.password === 'string' ? request.body.password : '';
  if (!email || !password) {
    return response.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return response.status(401).json({ message: 'Email or password is incorrect.' });
  }

  const token = jwt.sign(
    { sub: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' },
  );
  return response.json({ token, creator: { id: user.id, name: user.name, email: user.email } });
});

router.get('/me', requireAuth, async (request, response) => {
  const user = await User.findById(request.creator.sub).select('name email');
  if (!user) return response.status(401).json({ message: 'Creator account no longer exists.' });
  return response.json({ creator: { id: user.id, name: user.name, email: user.email } });
});

export default router;
