import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertPdfFileSchema } from "@shared/schema";
import { z } from "zod";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "server", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/files', (req, res, next) => {
    // Add CORS headers for file serving
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    next();
  }, express.static(uploadsDir));

  // Get all PDF files
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getAllPdfFiles();
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // Upload PDF file
  app.post("/api/upload", upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get the domain for public URL
      const domain = process.env.REPLIT_DOMAINS?.split(',')[0] || 
                    req.get('host') || 
                    'localhost:5000';
      
      const protocol = req.secure || req.get('X-Forwarded-Proto') === 'https' ? 'https' : 'http';
      const publicUrl = `${protocol}://${domain}/files/${req.file.filename}`;

      const fileData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        publicUrl: publicUrl,
      };

      // Validate the data
      const validatedData = insertPdfFileSchema.parse(fileData);
      
      // Save to storage
      const savedFile = await storage.createPdfFile(validatedData);
      
      res.json(savedFile);
    } catch (error) {
      console.error("Error uploading file:", error);
      
      // Clean up uploaded file if there was an error
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error cleaning up file:", unlinkError);
        }
      }
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid file data", errors: error.errors });
      }
      
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Delete PDF file
  app.delete("/api/files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
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

      // Delete physical file
      const filePath = path.join(uploadsDir, file.filename);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fsError) {
        console.error("Error deleting physical file:", fsError);
        // Continue even if physical file deletion fails
      }

      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
