import { type Image, type InsertImage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getCurrentImage(): Promise<Image | undefined>;
  storeImage(image: InsertImage): Promise<Image>;
  getImage(id: string): Promise<Image | undefined>;
  getAllImages(): Promise<Image[]>;
}

export class MemStorage implements IStorage {
  private images: Map<string, Image>;
  private currentImageId: string | undefined;

  constructor() {
    this.images = new Map();
  }

  async getCurrentImage(): Promise<Image | undefined> {
    if (!this.currentImageId) return undefined;
    return this.images.get(this.currentImageId);
  }

  async storeImage(insertImage: InsertImage): Promise<Image> {
    const id = randomUUID();
    const image: Image = { 
      id,
      type: insertImage.type,
      data: insertImage.data,
      filename: insertImage.filename ?? null,
      format: insertImage.format ?? null,
      width: insertImage.width ?? null,
      height: insertImage.height ?? null,
      size: insertImage.size ?? null,
      uploadedAt: new Date(),
    };
    this.images.set(id, image);
    this.currentImageId = id; // Set as current image
    return image;
  }

  async getImage(id: string): Promise<Image | undefined> {
    return this.images.get(id);
  }

  async getAllImages(): Promise<Image[]> {
    return Array.from(this.images.values()).sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }
}

export const storage = new MemStorage();
