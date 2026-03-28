import { pgTable, text, serial, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  fileSize: real("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  status: text("status", { enum: ["queued", "processing", "completed", "failed"] }).notNull().default("queued"),
  progress: real("progress").notNull().default(0),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
  extractedData: jsonb("extracted_data"),
  errorMessage: text("error_message"),
});

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, uploadedAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documentsTable.$inferSelect;
