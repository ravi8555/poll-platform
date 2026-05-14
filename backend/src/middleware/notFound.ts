// backend/src/middleware/notFound.ts
import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.url}`
  });
};