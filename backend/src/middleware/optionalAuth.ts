// // backend/src/middleware/optionalAuth.ts
// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import { User } from '../models/User.model.js';

// export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
//   try {

//     // Check session first
//     if (req.session && req.session.user) {
//       req.user = req.session.user;
//       console.log('OptionalAuth: User from session:', req.user?.id);
//       return next();
//     }

//     // Check cookie for token
//     const token = req.cookies?.token;
    
//     // Check JWT token
//     // const token = req.headers.authorization?.replace('Bearer ', '');
    
//     if (token) {
//       try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
//       const user = await User.findById(decoded.id);
//       if (user) {
//         req.user = {
//           id: user._id.toString(),
//           email: user.email,
//           name: user.name
//         };
//         console.log('OptionalAuth: User from token:', req.user?.id);
//       }
//       }
//        catch (error) {
//         console.log('OptionalAuth: Invalid token');
//       }
//     }
    
//     next();
//   } catch (error) {
//     console.error('OptionalAuth error:', error);
//     next();
//   }
// };


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