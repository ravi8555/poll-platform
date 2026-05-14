// backend/src/routes/auth.routes.ts
import { Router } from 'express';
import { 
  register, 
  login, 
  oidcLogin, 
  oidcCallback, 
  getMe, 
  logout,
  getOIDCStatus,
  initOIDC
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

// Debug Endpoint to Check Cookie temporary endpoint


const router = Router();

router.get('/token', authenticate, (req, res) => {
  try {
    // req.user is set by the authenticate middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// // Initialize OIDC on startup
// initOIDC();

// Local auth routes
router.post('/register', register);
router.post('/login', login);

// OIDC routes
router.get('/oidc/login', oidcLogin);
router.get('/oidc/callback', oidcCallback);
router.get('/oidc/status', getOIDCStatus);

// Protected routes
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);


router.get('/debug/cookie', (req, res) => {
  console.log('Cookies received:', req.cookies);
  console.log('Cookie header:', req.headers.cookie);
  
  res.json({
    cookies: req.cookies,
    hasToken: !!req.cookies?.token,
    cookieHeader: req.headers.cookie || 'No cookie header',
    userAgent: req.headers['user-agent']
  });
});

router.get('/config/check', (req, res) => {
  res.json({
    oidc: {
      issuerConfigured: !!process.env.OIDC_ISSUER,
      clientIdConfigured: !!process.env.OIDC_CLIENT_ID,
      clientSecretConfigured: !!process.env.OIDC_CLIENT_SECRET,
      redirectUriConfigured: !!process.env.OIDC_REDIRECT_URI,
      redirectUri: process.env.OIDC_REDIRECT_URI,
    },
    server: {
      port: process.env.PORT,
      env: process.env.NODE_ENV,
    }
  });
});


export default router;