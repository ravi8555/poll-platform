# Poll Platform - Full Stack Poll Creation & Analytics System

A full-stack real-time poll management platform that allows users to create polls, share them with respondents, collect live responses, and visualize results instantly.

The platform includes secure authentication (Local + OIDC), WebSocket-powered live updates, real-time vote tracking, and an admin dashboard for poll management.

---

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Secure session management
- OIDC / OAuth 2.0 login integration
- Protected routes
- Logout functionality

### Poll Management
- Create polls
- Edit existing polls
- Delete polls
- View poll details
- Publish / share polls
- Manage poll lifecycle

### Real-Time Polling
- Live response collection
- Instant vote updates using Socket.IO
- Real-time result synchronization
- Auto-refresh dashboard stats
- Multiple participant support

### Dashboard
- View all created polls
- Poll analytics
- Response counts
- Active / completed poll tracking
- Detailed poll insights

### Respondent Experience
- Join poll via shared link
- Submit responses instantly
- Real-time submission feedback
- Seamless voting experience

### Security
- JWT authentication
- OIDC authentication support
- PKCE flow implementation
- Secure cookie handling
- Input validation
- Protected backend APIs

---

## Tech Stack
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



### Database
- MongoDB
- Mongoose

### Authentication
- Local Authentication
- OIDC / OAuth 2.0
- PKCE
- JWKS validation

---

## Project Structure

```bash
poll-platform/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── sockets/
│   │   ├── utils/
│   │   └── config/
│   │
│   └── package.json
│
└── README.md

```

Installation
Clone Repository
git clone https://github.com/ravi8555/poll-platforml
cd poll-platform
Backend Setup

Navigate to backend:

cd backend

Install dependencies:

npm install

Create .env file:

PORT=5001
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/poll-platform

JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

FRONTEND_URL=http://localhost:5173

# OIDC Configuration
OIDC_ISSUER=https://auth.portfoliohub.in
https://auth.portfoliohub.in
OIDC_CLIENT_ID=9c54497ec7e0814d49942d898b7c1114
OIDC_CLIENT_SECRET=36b7529cfe185bfcbbe7fb150a22b2e79eef7201d32f95898029b95dedbf7af1
OIDC_REDIRECT_URI=http://localhost:5001/api/auth/oidc/callback
OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5173/login
OIDC_SCOPES=openid profile email


Run backend:

npm run dev
Frontend Setup

Navigate to frontend:

cd frontend

Install dependencies:

npm install

Create .env file:

VITE_API_URL=http://localhost:5001/api

### Run frontend:
npm run dev

## OIDC Authentication Flow


The platform supports OpenID Connect authentication using Authorization Code Flow with PKCE.


### What is OIDC SSO?

OpenID Connect (OIDC) is an authentication layer on top of OAuth 2.0 that allows users to sign in using their existing corporate credentials. This platform supports SSO (Single Sign-On) for both login and authenticated poll responses.

### How OIDC SSO Works

1. User clicks "Sign in with SSO"
2. Redirected to corporate OIDC provider login page
3. User authenticates with corporate credentials
4. Provider redirects back with authorization code
5. Backend exchanges code for tokens
6. User is automatically logged in to Poll Platform


## API Endpoints
### Authentication

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
GET  /api/auth/oidc/login
GET  /api/auth/oidc/callback
GET  /api/auth/oidc/status

### Polls
GET    /api/polls
GET    /api/polls/:id
POST   /api/polls
PUT    /api/polls/:id
DELETE /api/polls/:id
Responses
POST /api/responses
GET  /api/responses/:pollId

### WebSocket Events
Client Events
client:join-poll
client:submit-response
client:leave-poll

### Server Events
server:poll-updated
server:new-response
server:results-updated

### Authentication Architecture
Local Auth
Email / Password login
JWT generation
Secure cookie storage
OIDC Auth

### Authorization Code Flow
PKCE challenge / verifier
Token exchange
UserInfo endpoint integration
Internal session creation
Development Notes

For local development:

secure=false
sameSite=lax

For production:

secure=true
sameSite=none

## Author

Ravindra Dhadave

Frontend Developer | Full Stack Developer

License

This project is licensed under the MIT License.
