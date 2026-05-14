// backend/src/middleware/auth.ts (Updated for cookies)
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Debug logging
    console.log('Auth middleware - Cookies:', req.cookies);
    console.log('Auth middleware - Cookie header:', req.headers.cookie);
    
    // Check session first (for OIDC)
    if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
    }
    
    // Check cookie for token
    const token = req.cookies?.token;
    
    if (!token) {
      console.log('No token found in cookies');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log('Token found, verifying...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    };
    
    console.log('User authenticated:', req.user.email);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
// export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // Check session first (for OIDC)
//     if (req.session && req.session.user) {
//       req.user = req.session.user;
//       return next();
//     }
    
//     // Check cookie instead of Authorization header
//     const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({ error: 'Authentication required' });
//     }
    
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
//     const user = await User.findById(decoded.id);
    
//     if (!user) {
//       return res.status(401).json({ error: 'User not found' });
//     }
    
//     req.user = {
//       id: user._id.toString(),
//       email: user.email,
//       name: user.name
//     };
    
//     next();
//   } catch (error) {
//     return res.status(401).json({ error: 'Invalid or expired token' });
//   }
// };