import { type User, type InsertUser, type PdfFile, type InsertPdfFile } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // PDF file operations
  getPdfFile(id: string): Promise<PdfFile | undefined>;
  getAllPdfFiles(): Promise<PdfFile[]>;
  createPdfFile(file: InsertPdfFile): Promise<PdfFile>;
  deletePdfFile(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private pdfFiles: Map<string, PdfFile>;

  constructor() {
    this.users = new Map();
    this.pdfFiles = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPdfFile(id: string): Promise<PdfFile | undefined> {
    return this.pdfFiles.get(id);
  }

  async getAllPdfFiles(): Promise<PdfFile[]> {
    return Array.from(this.pdfFiles.values()).sort(
      (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
  }

  async createPdfFile(insertPdfFile: InsertPdfFile): Promise<PdfFile> {
    const id = randomUUID();
    const pdfFile: PdfFile = {
      ...insertPdfFile,
      id,
      uploadDate: new Date(),
    };
    this.pdfFiles.set(id, pdfFile);
    return pdfFile;
  }

  async deletePdfFile(id: string): Promise<boolean> {
    return this.pdfFiles.delete(id);
  }
}

export const storage = new MemStorage();
