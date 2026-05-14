// backend/src/config/cors.ts
export const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,  // MUST be true for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
};