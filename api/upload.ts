import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertPdfFileSchema } from '../shared/schema';
import { z } from 'zod';

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
    // For simplicity in Vercel deployment, we'll use base64 encoded files
    // In a production app, you'd use Vercel Blob or another storage service
    const { filename, originalName, size, fileData } = req.body;

    if (!filename || !originalName || !size || !fileData) {
      return res.status(400).json({ message: "Missing required file data" });
    }

    // Get the domain for public URL
    const domain = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const publicUrl = `${protocol}://${domain}/api/serve/${filename}`;

    const fileDataObj = {
      filename,
      originalName,
      size: parseInt(size),
      publicUrl,
    };

    // Validate the data
    const validatedData = insertPdfFileSchema.parse(fileDataObj);
    
    // Save to storage (Note: In Vercel, this will be in-memory only per function)
    const savedFile = await storage.createPdfFile(validatedData);
    
    res.json(savedFile);
  } catch (error) {
    console.error("Error uploading file:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid file data", errors: error.errors });
    }
    
    res.status(500).json({ message: "Failed to upload file" });
  }
}