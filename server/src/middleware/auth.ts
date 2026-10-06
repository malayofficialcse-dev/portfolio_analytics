import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  admin?: { id: string; email: string; role: string };
}

export const authenticateAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string };
    req.admin = decoded;
    next();
  } catch (err) {
    logger.warn('Invalid token attempt');
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
