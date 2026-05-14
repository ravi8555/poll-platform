// backend/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const responseRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 responses per windowMs
  message: 'Too many responses submitted from this IP, please try again later.',
  skipSuccessfulRequests: true,
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests, please try again later.'
});