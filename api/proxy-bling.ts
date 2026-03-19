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

  // No Vercel, req.body já vem parseado se o Content-Type for JSON
  // Mas vamos garantir que tratamos strings/objetos dependendo do cliente
  let body = req.body;
  if (typeof body === 'string') {
     try { body = JSON.parse(body); } catch(e) {}
  }

  const { clientId, clientSecret, grantType, code, redirectUri, refreshToken } = body;

  if (!clientId || !clientSecret || !grantType) {
    return res.status(400).json({ error: 'Faltam parâmetros obrigatórios (clientId, clientSecret, grantType)' });
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const params = new URLSearchParams();
    params.set('grant_type', grantType);
    
    if (grantType === 'authorization_code') {
      if (!code || !redirectUri) return res.status(400).json({ error: 'Code e RedirectUri são obrigatórios para authorization_code' });
      params.set('code', code);
      params.set('redirect_uri', redirectUri);
    } else if (grantType === 'refresh_token') {
      if (!refreshToken) return res.status(400).json({ error: 'RefreshToken é obrigatório para refresh_token' });
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
    console.error('Bling Proxy Error:', error);
    return res.status(500).json({ error: 'Erro interno no servidor proxy', message: error.message });
  }
}
