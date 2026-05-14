// backend/test-token-exchange.ts
import dotenv from 'dotenv';
dotenv.config();

async function testTokenExchange() {
  console.log('Testing token exchange with OIDC provider...');
  
  const tokenEndpoint = 'https://auth.portfoliohub.in/o/token';
  const clientId = process.env.OIDC_CLIENT_ID;
  const clientSecret = process.env.OIDC_CLIENT_SECRET;
  
  // You'll need a real code from a previous login attempt
  const testCode = 'YOUR_CODE_FROM_PREVIOUS_LOGIN';
  
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', testCode);
  params.append('redirect_uri', 'http://localhost:5001/api/auth/oidc/callback');
  params.append('client_id', clientId!);
  params.append('client_secret', clientSecret!);
  
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  
  const text = await response.text();
  console.log('Response status:', response.status);
  console.log('Response body:', text);
}

testTokenExchange();