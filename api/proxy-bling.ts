export default async function handler(req, res) {
  // CORS para permitir acesso do frontend
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
     try { body = JSON.parse(body); } catch(e) {}
  }

  // --- Caso 1: Proxy de Dados da API ---
  if (body.proxyUrl) {
    try {
      const response = await fetch(body.proxyUrl, {
        method: body.method || 'GET',
        headers: body.headers || {},
        body: body.body ? JSON.stringify(body.body) : undefined
      });
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return res.status(response.status).json(data);
      } else {
        const text = await response.text();
        return res.status(response.status).send(text);
      }
    } catch (error) {
      return res.status(500).json({ error: 'Erro no proxy de dados', message: error.message });
    }
  }

  // --- Caso 2: Proxy de Token (OAuth) ---
  const { clientId, clientSecret, grantType, code, redirectUri, refreshToken } = body;

  if (!clientId || !clientSecret || !grantType) {
    return res.status(400).json({ error: 'Faltam parâmetros obrigatórios (clientId, clientSecret, grantType ou proxyUrl)' });
  }

  try {
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
    return res.status(blingRes.status).json(data);
  } catch (error) {
    console.error('Bling Token Proxy Error:', error);
    return res.status(500).json({ error: 'Erro interno no servidor proxy de token', message: error.message });
  }
}
