import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // In production, fetch from database
    // For now, return empty array since serverless functions don't persist data
    return res.json([]);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: "File ID is required" });
    }

    // In production, delete from database
    // For now, just return success
    return res.json({ message: "File deleted successfully" });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
