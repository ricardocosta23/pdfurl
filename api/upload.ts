import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get request data
    const { filename, originalName, size, fileData } = req.body || {};
    
    if (!filename || !originalName || !size) {
      return res.status(400).json({ 
        message: "Missing required fields",
        received: { filename, originalName, size: !!size, fileData: !!fileData }
      });
    }

    // Get the domain for public URL
    const domain = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const publicUrl = `${protocol}://${domain}/api/serve/${filename}`;

    // Create file record
    const fileRecord = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filename: filename,
      originalName: originalName,
      size: parseInt(size.toString()),
      publicUrl,
      uploadDate: new Date().toISOString(),
    };
    
    return res.json(fileRecord);
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ 
      message: "Failed to upload file",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
