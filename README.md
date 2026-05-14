# Poll Platform - Full Stack Poll Creation & Analytics System

A complete full-stack platform for creating polls, collecting responses, and analyzing results in real-time with WebSocket live updates and SSO support.


## ✨ Features

### For Poll Creators
- ✅ **User Authentication** - Secure login/register with JWT and HTTP-only cookies
- ✅ **SSO Login** - Single Sign-On with OIDC provider
- ✅ **Poll Creation** - Create polls with multiple questions and options
- ✅ **Question Management** - Add/remove questions, mark as mandatory/optional
- ✅ **Response Mode** - Choose between anonymous or authenticated responses
- ✅ **Expiry System** - Set expiration date for polls
- ✅ **Real-time Analytics** - Live response updates without page refresh
- ✅ **Analytics Dashboard** - View response statistics with charts
- ✅ **CSV Export** - Download response data as CSV
- ✅ **Publish Results** - Make poll results publicly available

### For Respondents
- ✅ **Public Poll Form** - Easy to use interface for submitting responses
- ✅ **Mandatory Validation** - Ensures all required questions are answered
- ✅ **Authentication Support** - Login required for authenticated polls
- ✅ **SSO Login for Responses** - Use corporate credentials to respond
- ✅ **Thank You Page** - Confirmation after successful submission

### Security & Authentication
- ✅ **OIDC SSO Integration** - Single Sign-On with OpenID Connect
- ✅ **HTTP-only Cookies** - Secure authentication (no localStorage)
- ✅ **JWT Token Validation** - Stateless authentication
- ✅ **PKCE Flow** - Proof Key for Code Exchange for enhanced security
- ✅ **JWKS Validation** - JSON Web Key Set for token verification

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + HTTP-only Cookies + OIDC SSO
- **SSO Protocol**: OpenID Connect (OIDC)
- **Real-time**: Socket.io
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6

## 🔐 OIDC SSO Configuration

### What is OIDC SSO?

OpenID Connect (OIDC) is an authentication layer on top of OAuth 2.0 that allows users to sign in using their existing corporate credentials. This platform supports SSO (Single Sign-On) for both login and authenticated poll responses.

### How OIDC SSO Works

1. User clicks "Sign in with SSO"
2. Redirected to corporate OIDC provider login page
3. User authenticates with corporate credentials
4. Provider redirects back with authorization code
5. Backend exchanges code for tokens
6. User is automatically logged in to Poll Platform

### OIDC Configuration

Add these environment variables to your `.env` file:

```env
# OIDC Configuration
OIDC_ISSUER=https://your-oidc-provider.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_REDIRECT_URI=http://localhost:5001/api/auth/oidc/callback
OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5173/login
OIDC_SCOPES=openid profile email
```
```bash
OIDC Endpoints
Endpoint	Description
GET /api/auth/oidc/login	Initiate SSO login
GET /api/auth/oidc/callback	OIDC callback handler
GET /api/auth/oidc/status	Check OIDC configuration status
Testing OIDC Locally
Register your application with OIDC provider

Add redirect URI: http://localhost:5001/api/auth/oidc/callback

Configure environment variables

Restart the backend server

Click "Sign in with SSO" on login page

Security Features
PKCE (Proof Key for Code Exchange) - Prevents authorization code interception

State Parameter - CSRF protection

Nonce Validation - Replay attack prevention

JWKS Validation - Cryptographic token verification

HTTP-only Cookies - XSS protection
```
📋 Prerequisites
Node.js (v18 or higher)

MongoDB (local or Atlas)

npm or yarn

OIDC provider account (for SSO)

🔧 Installation
1. Clone the repository
bash

git clone https://github.com/ravi8555/poll-platform.git
cd poll-platform


##2. Backend Setup
bash
cd backend
npm install
Create a .env file in the backend directory:

env
# Server
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/poll-platform

# JWT & Session
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-session-secret-key-change-this

# OIDC SSO Configuration (Optional - remove if not using SSO)
OIDC_ISSUER=https://your-oidc-provider.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_REDIRECT_URI=http://localhost:5001/api/auth/oidc/callback
OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5173/login
OIDC_SCOPES=openid profile email
Start the backend server:

bash
npm run dev
3. Frontend Setup
bash
cd frontend
npm install
Create a .env file in the frontend directory:

env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
Start the frontend development server:

bash
npm run dev
4. Access the Application
Frontend: http://localhost:5173

Backend API: http://localhost:5001

Health Check: http://localhost:5001/health

OIDC Status: http://localhost:5001/api/auth/oidc/status

🎯 API Endpoints
Authentication (Local)
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login user
GET	/api/auth/me	Get current user
POST	/api/auth/logout	Logout user
Authentication (OIDC SSO)
Method	Endpoint	Description
GET	/api/auth/oidc/login	Initiate SSO login
GET	/api/auth/oidc/callback	OIDC callback handler
GET	/api/auth/oidc/status	Check OIDC configuration
GET	/api/auth/token	Get WebSocket token

Polls

Method	Endpoint	Description
POST	/api/polls	Create a new poll
GET	/api/polls/my-polls	Get user's polls
GET	/api/polls/:id	Get poll by ID
PUT	/api/polls/:id	Update poll
DELETE	/api/polls/:id	Delete poll
Responses
Method	Endpoint	Description
POST	/api/responses/submit	Submit poll response
GET	/api/responses/poll/:link	Get poll by shareable link
GET	/api/responses/poll/:pollId/responses	Get all responses
Analytics
Method	Endpoint	Description
GET	/api/analytics/poll/:pollId	Get poll analytics
GET	/api/analytics/public/:shareableLink	Get public results
POST	/api/analytics/poll/:pollId/publish	Publish/unpublish results
GET	/api/analytics/poll/:pollId/export	Export CSV
🔌 WebSocket Events
Client to Server
Event	Description
join-poll	Join a poll room for live updates
leave-poll	Leave a poll room
Server to Client
Event	Description
response-count-update	Live response count update
analytics-update	Analytics data update
connection-confirmed	WebSocket connection confirmation
🚀 Deployment
Backend Deployment (Render/Railway)
Push code to GitHub

Create a new Web Service on Render

Connect your repository

Set build command: npm install && npm run build

Set start command: npm start

Add environment variables (including OIDC config if using SSO)

Frontend Deployment (Vercel/Netlify)
Push code to GitHub

Import project to Vercel

Set build command: npm run build

Set output directory: dist

Add environment variable: VITE_API_URL (your deployed backend URL)

Database (MongoDB Atlas)
Create a free cluster on MongoDB Atlas

Get connection string

Add to backend environment variables


🔒 Security Best Practices
Always use HTTPS in production

Store secrets in environment variables

Enable rate limiting for API endpoints

Use HTTP-only cookies for tokens

Implement CSRF protection

Validate all user inputs

Keep dependencies updated

Use OIDC with PKCE for SSO

🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

📝 License
MIT License - see LICENSE file for details

👏 Acknowledgments
React

Express.js

MongoDB

Tailwind CSS

Socket.io

OpenID Connect