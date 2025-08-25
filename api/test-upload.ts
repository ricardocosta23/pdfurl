import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.json({
    message: "Test endpoint working",
    method: req.method,
    headers: req.headers,
    bodyType: typeof req.body,
    body: req.body ? JSON.stringify(req.body).substring(0, 200) + '...' : 'undefined'
  });
}