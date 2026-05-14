// backend/src/types/express.d.ts
import 'express';
import { Session } from 'express-session';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      name: string;
      oidcId?: string;
    };
    session: Session & {
      oidcNonce?: string;
      oidcState?: string;
      user?: {
        id: string;
        email: string;
        name: string;
        oidcId?: string;
      };
    };
  }
}