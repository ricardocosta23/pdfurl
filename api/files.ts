import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory storage for demo purposes
let fileStorage: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Return files sorted by upload date (newest first)
    const sortedFiles = fileStorage.sort((a, b) => 
      new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
    return res.json(sortedFiles);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: "File ID is required" });
    }

    // Remove from storage
    const initialLength = fileStorage.length;
    fileStorage = fileStorage.filter(file => file.id !== id);
    
    if (fileStorage.length < initialLength) {
      return res.json({ message: "File deleted successfully" });
    } else {
      return res.status(404).json({ message: "File not found" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

// Export storage so upload can use it
export { fileStorage };
