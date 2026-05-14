// backend/test-jwks.ts
import * as jose from 'jose';
import dotenv from 'dotenv';
dotenv.config();

async function testJWKS() {
  console.log('Testing JWKS validation...');
  
  const issuer = process.env.OIDC_ISSUER;
  console.log('Issuer:', issuer);
  
  try {
    // Fetch OIDC config
    const configRes = await fetch(`${issuer}/.well-known/openid-configuration`);
    const config = await configRes.json();
    console.log('✅ OIDC config loaded');
    console.log('JWKS URI:', config.jwks_uri);
    
    // Fetch JWKS
    const jwksRes = await fetch(config.jwks_uri);
    const jwks = await jwksRes.json();
    console.log(`✅ JWKS loaded with ${jwks.keys.length} keys`);
    
    // Display key information
    for (const key of jwks.keys) {
      console.log(`  - Key ID: ${key.kid}`);
      console.log(`    Algorithm: ${key.alg}`);
      console.log(`    Type: ${key.kty}`);
    }
    
    // Create JWKS remote client (jose v5+ syntax)
    const jwksURL = new URL(config.jwks_uri);
    const JWKS = jose.createRemoteJWKSet(jwksURL);
    console.log('✅ JWKS client ready for validation');
    
    console.log('\n📝 To test full OIDC flow:');
    console.log(`1. Visit: http://localhost:5000/api/auth/oidc/login`);
    console.log(`2. Login with your credentials`);
    console.log(`3. You will be redirected to dashboard with validated token`);
    
  } catch (error) {
    console.error('❌ JWKS test failed:', error);
  }
}

testJWKS();