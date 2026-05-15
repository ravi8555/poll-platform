
// backend/src/middleware/optionalAuth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('=== Optional Auth Middleware ===');
    console.log('Cookies:', req.cookies);
    
    // Check cookie for token
    const token = req.cookies?.token;
    
    if (!token) {
      console.log('No token found in cookies');
      return next();
    }
    
    console.log('Token found, verifying...');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      console.log('Decoded token:', { id: decoded.id, email: decoded.email });
      
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = {
          id: user._id.toString(),
          email: user.email,
          name: user.name
        };
        console.log('User set in req.user:', req.user);
      } else {
        console.log('User not found in database');
      }
    } catch (err) {
      console.log('Token verification failed:', err);
    }
    
    next();
  } catch (error) {
    console.error('OptionalAuth error:', error);
    next();
  }
};