import jwt from 'jsonwebtoken';

export function requireAuth(request, response, next) {
  const token = request.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return response.status(401).json({ message: 'Creator authentication is required.' });
  }

  try {
    request.creator = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return response.status(401).json({ message: 'Your session is invalid or has expired.' });
  }
}
