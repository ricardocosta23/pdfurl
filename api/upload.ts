import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Simple validation schema
const uploadSchema = z.object({
  filename: z.string(),
  originalName: z.string(), 
  size: z.union([z.number(), z.string().transform(Number)]),
  fileData: z.string(),
});

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
    // Debug logging
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request body type:', typeof req.body);
    console.log('Request body:', req.body);
    
    // Parse JSON body if it's a string
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ message: "Invalid JSON in request body" });
      }
    }
    
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ 
        message: "Request body is required",
        debug: {
          bodyType: typeof req.body,
          bodyContent: req.body,
          contentType: req.headers['content-type']
        }
      });
    }

    // Validate request body
    const validatedData = uploadSchema.parse(body);
    
    // Get the domain for public URL
    const domain = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const publicUrl = `${protocol}://${domain}/api/serve/${validatedData.filename}`;

    // Create file record (in production, save to database)
    const fileRecord = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filename: validatedData.filename,
      originalName: validatedData.originalName,
      size: validatedData.size,
      publicUrl,
      uploadDate: new Date().toISOString(),
    };
    
    res.json(fileRecord);
  } catch (error) {
    console.error("Error uploading file:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid file data", errors: error.errors });
    }
    
    res.status(500).json({ message: "Failed to upload file" });
  }
}
