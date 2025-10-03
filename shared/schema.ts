import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const images = pgTable("images", {
  id: varchar("id").primaryKey(),
  type: text("type").notNull(), // 'base64', 'url', 'upload'
  data: text("data").notNull(), // base64 string, url, or file path
  filename: text("filename"),
  format: text("format"), // 'jpeg', 'png', 'gif', 'webp'
  width: integer("width"),
  height: integer("height"),
  size: integer("size"), // file size in bytes
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertImageSchema = createInsertSchema(images).pick({
  type: true,
  data: true,
  filename: true,
  format: true,
  width: true,
  height: true,
  size: true,
});

export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;

// API request schemas
export const base64ImageSchema = z.object({
  type: z.literal("base64"),
  data: z.string(),
  metadata: z.object({
    filename: z.string().optional(),
    format: z.string().optional(),
  }).optional(),
});

export const urlImageSchema = z.object({
  type: z.literal("url"),
  url: z.string().url(),
  metadata: z.object({
    source: z.string().optional(),
  }).optional(),
});

export const imageUploadSchema = z.union([
  base64ImageSchema,
  urlImageSchema,
]);

export type Base64ImageRequest = z.infer<typeof base64ImageSchema>;
export type UrlImageRequest = z.infer<typeof urlImageSchema>;
export type ImageUploadRequest = z.infer<typeof imageUploadSchema>;
