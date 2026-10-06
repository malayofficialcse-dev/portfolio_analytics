import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AdminUser } from '../models/AdminUser';
import { logger } from '../utils/logger';

// POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const identity = (req.body.identity || req.body.email || req.body.username || '').trim();
    const password = req.body.password;
    if (!identity || !password) {
      res.status(400).json({ message: 'Email/username and password are required' });
      return;
    }

    const admin = await AdminUser.findOne({
      $or: [{ email: identity.toLowerCase() }, { username: identity }],
    });

    if (!admin || !(await admin.comparePassword(password))) {
      logger.warn(`Failed login attempt for: ${identity}`);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) { res.status(500).json({ message: 'Server configuration error' }); return; }

    const token = jwt.sign(
      { id: admin._id.toString(), email: admin.email, role: admin.role },
      secret,
      { expiresIn: '7d' }
    );

    admin.lastLogin = new Date();
    await admin.save();

    logger.info(`Admin logged in: ${admin.email}`);
    res.json({ token, admin: { id: admin._id, email: admin.email, username: admin.username, role: admin.role, name: admin.username } });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) { res.status(401).json({ message: 'No token' }); return; }

    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { id: string };
    const admin = await AdminUser.findById(decoded.id).select('-passwordHash');
    if (!admin) { res.status(404).json({ message: 'Admin not found' }); return; }

    res.json(admin);
  } catch (err) {
    next(err);
  }
};
