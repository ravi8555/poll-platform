// // backend/src/services/oidc.service.ts
// import { createRemoteJWKSet, jwtVerify, decodeJwt } from 'jose';
// import crypto from 'crypto';
// import logger from '../utils/logger.js';

// interface TokenResponse {
//   access_token?: string;
//   id_token?: string;
//   token_type?: string;
//   expires_in?: number;
//   refresh_token?: string;
//   success?: boolean;
// }

// class OIDCService {
//   private static instance: OIDCService;
//   private config: any = null;
//   private jwksURL: URL | null = null;

//   private constructor() {}

//   static getInstance(): OIDCService {
//     if (!OIDCService.instance) {
//       OIDCService.instance = new OIDCService();
//     }
//     return OIDCService.instance;
//   }

//   generateCodeVerifier(): string {
//     return crypto.randomBytes(32).toString('base64url');
//   }

//   generateCodeChallenge(verifier: string): string {
//     return crypto
//       .createHash('sha256')
//       .update(verifier)
//       .digest('base64url');
//   }

//   async loadOIDCConfig(): Promise<any> {
//     const issuer = process.env.OIDC_ISSUER;
//     if (!issuer) {
//       throw new Error('OIDC_ISSUER not configured');
//     }

//     try {
//       const response = await fetch(`${issuer}/.well-known/openid-configuration`);
//       this.config = await response.json();
//       console.log('✅ OIDC configuration loaded');
//       this.jwksURL = new URL(this.config.jwks_uri);
//       return this.config;
//     } catch (error) {
//       console.error('Failed to load OIDC config:', error);
//       throw error;
//     }
//   }

//   async exchangeCodeForTokens(code: string, redirectUri: string, codeVerifier: string): Promise<any> {
//     const tokenEndpoint = 'https://auth.portfoliohub.in/o/token';
//     const clientId = process.env.OIDC_CLIENT_ID;
//     const clientSecret = process.env.OIDC_CLIENT_SECRET;

//     console.log('🔄 Exchanging code for tokens...');
//     console.log('Token endpoint:', tokenEndpoint);
//     console.log('Client ID:', clientId);
//     console.log('Redirect URI:', redirectUri);
//     console.log('Code verifier length:', codeVerifier.length);

//     // Try different approaches based on the provider's expected format
//     const approaches = [
//       {
//         name: 'With client_secret',
//         body: new URLSearchParams({
//           grant_type: 'authorization_code',
//           code: code,
//           redirect_uri: redirectUri,
//           client_id: clientId!,
//           client_secret: clientSecret!,
//           code_verifier: codeVerifier,
//         }).toString()
//       },
//       {
//         name: 'Without client_secret',
//         body: new URLSearchParams({
//           grant_type: 'authorization_code',
//           code: code,
//           redirect_uri: redirectUri,
//           client_id: clientId!,
//           code_verifier: codeVerifier,
//         }).toString()
//       },
//       {
//         name: 'JSON format',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           grant_type: 'authorization_code',
//           code: code,
//           redirect_uri: redirectUri,
//           client_id: clientId,
//           client_secret: clientSecret,
//           code_verifier: codeVerifier,
//         })
//       }
//     ];

//     for (const approach of approaches) {
//       try {
//         console.log(`Trying ${approach.name}...`);
        
//         const response = await fetch(tokenEndpoint, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             ...(approach.headers || {})
//           },
//           body: approach.body,
//         });

//         const responseText = await response.text();
        
//         if (response.ok) {
//           console.log(`✅ ${approach.name} successful!`);
//           try {
//             return JSON.parse(responseText);
//           } catch {
//             return { success: true, raw: responseText };
//           }
//         } else {
//           console.log(`${approach.name} failed: ${response.status}`);
//           console.log('Response:', responseText.substring(0, 200));
//         }
//       } catch (error: any) {
//         console.log(`${approach.name} error:`, error.message);
//       }
//     }

//     throw new Error('All token exchange approaches failed');
//   }

//   decodeToken(token: string): any {
//     try {
//       return decodeJwt(token);
//     } catch (error) {
//       console.error('Failed to decode token:', error);
//       return null;
//     }
//   }
// }

// export default OIDCService.getInstance();



// backend/src/services/oidc.service.ts
import { createRemoteJWKSet, jwtVerify, decodeJwt } from 'jose';
import crypto from 'crypto';
import { log } from 'console';

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  success?: boolean;
}

class OIDCService {
  private static instance: OIDCService;
  private config: any = null;
  private jwksURL: URL | null = null;

  private constructor() {}

  static getInstance(): OIDCService {
    if (!OIDCService.instance) {
      OIDCService.instance = new OIDCService();
    }
    return OIDCService.instance;
  }

  generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  generateCodeChallenge(verifier: string): string {
    return crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');
  }
  async loadOIDCConfig(): Promise<any> {
    const issuer = process.env.OIDC_ISSUER;
    if (!issuer) {
      throw new Error('OIDC_ISSUER not configured');
    }

    try {
      const response = await fetch(`${issuer}/.well-known/openid-configuration`);
      this.config = await response.json();
      console.log('✅ OIDC configuration loaded');
      this.jwksURL = new URL(this.config.jwks_uri);
      return this.config;
    } catch (error) {
      console.error('Failed to load OIDC config:', error);
      throw error;
    }
  }

//   async exchangeCodeForTokens(code: string, redirectUri: string, codeVerifier: string): Promise<any> {

//     if (!this.config) {
//     await this.loadOIDCConfig();
//   }
    
//     // const tokenEndpoint = 'https://auth.portfoliohub.in/o/token';

//     const tokenEndpoint = this.config.token_endpoint;
//     const clientId = process.env.OIDC_CLIENT_ID;
//     // const clientSecret = process.env.OIDC_CLIENT_SECRET;

//     const params = new URLSearchParams({
//     grant_type: 'authorization_code',
//     code,
//     redirect_uri: redirectUri,
//     client_id: process.env.OIDC_CLIENT_ID!,
//     client_secret: process.env.OIDC_CLIENT_SECRET!,
//     code_verifier: codeVerifier,
//   });

//   const credentials = Buffer.from(
//   `${process.env.OIDC_CLIENT_ID}:${process.env.OIDC_CLIENT_SECRET}`
// ).toString('base64');

//   // const response = await fetch(tokenEndpoint, {
//   //   method: 'POST',
//   //   headers: {
//   //     'Content-Type': 'application/x-www-form-urlencoded',
//   //   },
//   //   body: params.toString(),
//   // });

//   console.log({
//   code,
//   redirectUri,
//   codeVerifier,
//   clientId,
// });
// console.log("====================>");

// console.log({
//   clientId: process.env.OIDC_CLIENT_ID,
//   clientSecret: process.env.OIDC_CLIENT_SECRET
// });
//   const response = await fetch(tokenEndpoint, {
    
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/x-www-form-urlencoded',
//     Authorization: `Basic ${credentials}`,
//   },
//   body: new URLSearchParams({
//     grant_type: 'authorization_code',
//     code,
//     redirect_uri: redirectUri,
//     code_verifier: codeVerifier,
//   }),
// });

//   const text = await response.text();

//   if (!response.ok) {
//     throw new Error(`Token exchange failed: ${text}`);
//   }

//   console.log('Token endpoint:', tokenEndpoint);
//   console.log('Response body:', text);

//   return JSON.parse(text);

//     console.log('🔄 Exchanging code for tokens...');
    
//     // Build request body according to provider's expected format
//     // const params = new URLSearchParams();
//     // params.append('grant_type', 'authorization_code');
//     // params.append('code', code);
//     // params.append('redirect_uri', redirectUri);
//     // params.append('client_id', clientId!);
//     // params.append('client_secret', clientSecret!);
//     // params.append('code_verifier', codeVerifier);

//     // const response = await fetch(tokenEndpoint, {
//     //   method: 'POST',
//     //   headers: {
//     //     'Content-Type': 'application/x-www-form-urlencoded',
//     //   },
//     //   body: params,
//     // });

//     // const responseText = await response.text();
//     // console.log('Token response status:', response.status);
    
//     // if (!response.ok) {
//     //   console.error('Token exchange failed:', responseText);
//     //   throw new Error(`Token exchange failed: ${response.status}`);
//     // }

//     // const tokens = JSON.parse(responseText);
//     // console.log('Token exchange response:', tokens);
    
//     // return tokens;


    

//   }

async exchangeCodeForTokens(
  code: string,
  redirectUri: string,
  codeVerifier: string
) {
  const tokenEndpoint = 'http://localhost:3000/o/token';
  // const tokenEndpoint = `${process.env.OIDC_ISSUER}/o/token'`;

  const clientId = process.env.OIDC_CLIENT_ID!;
  const clientSecret = process.env.OIDC_CLIENT_SECRET!;

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
    code_verifier: codeVerifier,
  });

  console.log("REQUEST BODY:", params.toString());

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const text = await response.text();

  console.log("TOKEN RESPONSE:", text);

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${text}`);
  }

  return JSON.parse(text);
}

  async getUserInfo(accessToken: string): Promise<any> {

    if(!this.config){
      await this.loadOIDCConfig()
    }
    try {
      const response = await fetch(`${this.config.userinfo_endpoint}`, {
        
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get userinfo:', error);
    }
    return null;
  }
}

export default OIDCService.getInstance();