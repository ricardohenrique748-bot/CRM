import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        // We can use the simple proxy or a custom middleware
      }
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/proxy-bling')) {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsedBody = JSON.parse(body);
                // Implementation follows the same logic as api/proxy-bling.ts
                
                // --- Caso 1: Proxy de Dados da API ---
                if (parsedBody.proxyUrl) {
                    const response = await fetch(parsedBody.proxyUrl, {
                      method: parsedBody.method || 'GET',
                      headers: parsedBody.headers || {},
                      body: parsedBody.body ? JSON.stringify(parsedBody.body) : undefined
                    });
                    
                    const contentType = response.headers.get('content-type');
                    res.statusCode = response.status;
                    res.setHeader('Content-Type', contentType || 'application/json');
                    
                    if (contentType && contentType.includes('application/json')) {
                      const data = await response.json();
                      res.end(JSON.stringify(data));
                    } else {
                      const text = await response.text();
                      res.end(text);
                    }
                    return;
                }

                // --- Caso 2: Proxy de Token ---
                const { clientId, clientSecret, grantType, code, redirectUri, refreshToken } = parsedBody;
                const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
                const params = new URLSearchParams();
                params.set('grant_type', grantType);
                if (grantType === 'authorization_code') {
                  params.set('code', code);
                  params.set('redirect_uri', redirectUri);
                } else if (grantType === 'refresh_token') {
                  params.set('refresh_token', refreshToken);
                }

                const blingRes = await fetch('https://www.bling.com.br/Api/v3/oauth/token', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': authHeader
                  },
                  body: params.toString()
                });

                const data = await blingRes.json();
                res.statusCode = blingRes.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              } catch (error: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
              }
            });
          } else {
             res.statusCode = 405;
             res.end(JSON.stringify({ error: 'Method not allowed' }));
          }
          return;
        }
        next();
      });
    }
  };
});
