import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const files = await storage.getAllPdfFiles();
      return res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      return res.status(500).json({ message: "Failed to fetch files" });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: "File ID is required" });
      }

      // Get file info before deleting
      const file = await storage.getPdfFile(id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Delete from storage
      const deleted = await storage.deletePdfFile(id);
      if (!deleted) {
        return res.status(404).json({ message: "File not found" });
      }

      return res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      return res.status(500).json({ message: "Failed to delete file" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}