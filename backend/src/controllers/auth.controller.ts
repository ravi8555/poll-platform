// // backend/src/controllers/auth.controller.ts
// import { Request, Response } from 'express';
// import { Issuer, generators } from 'openid-client';
// import { User } from '../models/User.model.js';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
// import logger from '../utils/logger.js';
// import oidcService from '../services/oidc.service.js';

// // Initialize OIDC service on startup
// export const initOIDC = async () => {
//   try {
//     await oidcService.loadOIDCConfig();
//     logger.info('OIDC service initialized with JWKS validation');
//   } catch (error) {
//     logger.warn('OIDC initialization failed, using local auth only:', error);
//   }
// };

// // Local Registration (fallback)
// export const register = async (req: Request, res: Response) => {
//   try {
//     const { name, email, password } = req.body;
    
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: 'User already exists' });
//     }
    
//     const hashedPassword = await bcrypt.hash(password, 10);
    
//     const user = new User({
//       name,
//       email,
//       password: hashedPassword
//     });
    
//     await user.save();
    
//     const token = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.JWT_SECRET || 'secret',
//       { expiresIn: '7d' }
//     );
    
//     res.status(201).json({
//       message: 'User registered successfully',
//       token,
//       user: { id: user._id, name: user.name, email: user.email }
//     });
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Local Login (fallback)
// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
    
//     const user = await User.findOne({ email }).select('+password');
//     if (!user) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }
    
//     const isValidPassword = await bcrypt.compare(password, user.password || '');
//     if (!isValidPassword) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }
    
//     const token = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.JWT_SECRET || 'secret',
//       { expiresIn: '7d' }
//     );
    
//     // Set HTTP-only cookie instead of returning token in response body
//     res.cookie('token', token, {
//       httpOnly: true,      // Prevents JavaScript access (XSS protection)
//       secure: process.env.NODE_ENV === 'production', // HTTPS only in production
//       sameSite: 'strict',  // CSRF protection
//       maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
//     });
    
//     res.json({
//       message: 'Login successful',
//       user: { id: user._id, name: user.name, email: user.email }
//     });
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// };
// // OIDC Login - Redirect to OIDC provider
// export const oidcLogin = (req: Request, res: Response) => {
//   const issuer = process.env.OIDC_ISSUER;
//   const clientId = process.env.OIDC_CLIENT_ID;
  
//   if (!issuer || !clientId) {
//     return res.status(500).json({ error: 'OIDC not configured' });
//   }
  
//   const nonce = generators.nonce();
//   const state = generators.state();
  
//   req.session.oidcNonce = nonce;
//   req.session.oidcState = state;
  
//   // Build authorization URL
//   const authUrl = `${issuer}/o/authenticate?` + new URLSearchParams({
//     client_id: clientId,
//     redirect_uri: process.env.OIDC_REDIRECT_URI || '',
//     response_type: 'code',
//     scope: process.env.OIDC_SCOPES || 'openid profile email',
//     state: state,
//     nonce: nonce,
//   });
  
//   logger.info('Redirecting to OIDC login');
//   res.redirect(authUrl);
// };

// // OIDC Callback - Handle OIDC redirect with JWKS validation
// export const oidcCallback = async (req: Request, res: Response) => {
//   try {
//     const { code, state } = req.query;
    
//     if (!code || typeof code !== 'string') {
//       throw new Error('No authorization code received');
//     }
    
//     // Validate state to prevent CSRF
//     if (state !== req.session.oidcState) {
//       logger.error('State mismatch', { received: state, expected: req.session.oidcState });
//       return res.status(400).send('Invalid state parameter');
//     }
    
//     // Exchange code for tokens
//     const tokens = await oidcService.exchangeCodeForTokens(
//       code,
//       process.env.OIDC_REDIRECT_URI || ''
//     );
    
//     // Validate ID token using JWKS
//     const validatedPayload = await oidcService.validateIdToken(tokens.id_token);
    
//     // Get user info from validated payload
//     const userInfo = validatedPayload;
    
//     logger.info('OIDC user validated', { 
//       sub: userInfo.sub, 
//       email: userInfo.email,
//       name: userInfo.name 
//     });
    
//     // Find or create user in database
//     let user = await User.findOne({ oidcId: userInfo.sub });
    
//     if (!user) {
//       user = new User({
//         oidcId: userInfo.sub,
//         email: userInfo.email || `${userInfo.sub}@oidc.user`,
//         name: userInfo.name || userInfo.given_name || userInfo.preferred_username || 'User',
//       });
//       await user.save();
//       logger.info('New user created from OIDC', { userId: user._id });
//     }
    
//     const token = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.JWT_SECRET || 'secret',
//       { expiresIn: '7d' }
//     );
    
//     // Set HTTP-only cookie
//     res.cookie('token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 7 * 24 * 60 * 60 * 1000
//     });
    
    
//     // Redirect to frontend dashboard with token
//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
//     res.redirect(`${frontendUrl}/dashboard?token=${token}`);
    
//   } catch (error: any) {
//     logger.error('OIDC callback error:', error);
//     res.status(500).send(`Authentication failed: ${error.message}`);
//   }
// };

// // Get OIDC status
// export const getOIDCStatus = (req: Request, res: Response) => {
//   res.json({
//     configured: !!process.env.OIDC_ISSUER,
//     issuer: process.env.OIDC_ISSUER,
//     clientConfigured: !!process.env.OIDC_CLIENT_ID,
//     jwksConfigured: true
//   });
// };

// // Get current user
// export const getMe = async (req: Request, res: Response) => {
//   try {
//     const user = await User.findById(req.user?.id).select('-password');
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     res.json(user);
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Logout
// export const logout = (req: Request, res: Response) => {
//    res.clearCookie('token', {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'strict'
//   });
  
//   req.session.destroy((err) => {
//     if (err) {
//       return res.status(500).json({ error: 'Logout failed' });
//     }
//     res.json({ message: 'Logged out successfully' });
//   });
// };




// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { Issuer, generators } from 'openid-client';
import { User } from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';
import oidcService from '../services/oidc.service.js';
import crypto from 'crypto';


declare module 'express-session' {
  interface Session {
    oidcNonce?: string;
    oidcState?: string;
    oidcCodeVerifier?: string;
  }
}


// Helper function to set cookie consistently
const setAuthCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // Set to false for local development (HTTP)
    sameSite: 'lax', // 'lax' is better for development
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    domain: 'localhost', // Explicit domain for localhost
  });
};


let oidcInitialized = false;
// Initialize OIDC service on startup
export const initOIDC = async () => {
  try {
    await oidcService.loadOIDCConfig();
    logger.info('OIDC service initialized with JWKS validation');
  } catch (error) {
    logger.warn('OIDC initialization failed, using local auth only:', error);
  }
};
initOIDC();
// Store code verifiers in session (temporarily)
declare module 'express-session' {
  interface Session {
    oidcNonce?: string;
    oidcState?: string;
    oidcCodeVerifier?: string;
  }
}

// OIDC Login
export const oidcLogin = async (req: Request, res: Response) => {
  const issuer = process.env.OIDC_ISSUER;
  const clientId = process.env.OIDC_CLIENT_ID;
  const redirectUri = process.env.OIDC_REDIRECT_URI;
  
  // Generate PKCE values
  const codeVerifier = oidcService.generateCodeVerifier();
  const codeChallenge = oidcService.generateCodeChallenge(codeVerifier);
  const state = crypto.randomBytes(32).toString('base64url');
  
  // Store in session
  req.session.oidcState = state;
  req.session.oidcCodeVerifier = codeVerifier;
  
  await oidcService.loadOIDCConfig();
  // Build authorization URL
  // const authUrl = `${issuer}/o/authenticate?` + new URLSearchParams({
  const authUrl = `${oidcService.config.authorization_endpoint}?` + new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri!,
    response_type: 'code',
    scope: 'openid profile email',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  
  console.log('OIDC Login - Redirecting');
  res.redirect(authUrl);
};

// OIDC Callback
export const oidcCallback = async (req: Request, res: Response) => {
  console.log('=== OIDC CALLBACK ===');
  
  try {
    const { code, state } = req.query;
    
    if (!code || typeof code !== 'string') {
      throw new Error('No authorization code received');
    }
    
    if (state !== req.session.oidcState) {
      console.error('State mismatch');
      return res.status(400).send('Invalid state parameter');
    }
    
    const codeVerifier = req.session.oidcCodeVerifier;
    if (!codeVerifier) {
      console.error('No code verifier in session');
      return res.status(400).send('Invalid PKCE flow');
    }
    
    // Exchange code for tokens
    const tokenResponse = await oidcService.exchangeCodeForTokens(
      code,
      process.env.OIDC_REDIRECT_URI || '',
      codeVerifier
    );
    
    // Get user info using the access token
    let userInfo = null;
    if (tokenResponse.access_token) {
      userInfo = await oidcService.getUserInfo(tokenResponse.access_token);
      console.log('User info:', userInfo);
    }
    
    if (!userInfo) {
      throw new Error('Could not get user information');
    }
    
    // Find or create user
    let user = await User.findOne({ oidcId: userInfo.sub });
    if (!user && userInfo.email) {
      user = await User.findOne({ email: userInfo.email });
    }
    
    if (!user) {
      user = new User({
        oidcId: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name || userInfo.given_name || 'User',
      });
      await user.save();
      console.log('New user created:', user.email);
    }
    
    // Generate app JWT
    const appToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    // Set cookie (secure: false for localhost)
    res.cookie('token', appToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard`);
    
  } catch (error: any) {
    console.error('OIDC callback error:', error);
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
};

// Get OIDC status
export const getOIDCStatus = (req: Request, res: Response) => {
  res.json({
    configured: !!process.env.OIDC_ISSUER,
    issuer: process.env.OIDC_ISSUER,
    clientConfigured: !!process.env.OIDC_CLIENT_ID,
    jwksConfigured: true
  });
};


// Login endpoint
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password || '');
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    // Set cookie with proper settings
    setAuthCookie(res, token);
    
    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Register endpoint
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    // Set cookie with proper settings
    setAuthCookie(res, token);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Logout endpoint - clear cookie
export const logout = async (req: Request, res: Response) => {
  try {
    // Clear the cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    // Destroy session if using OIDC
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
    });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


// Get current user
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};



