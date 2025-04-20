// src/writers/schemas.ts
import { z } from 'zod';

export const MemoryWriterSchema = z.object({});

export const FileWriterSchema = z.object({
  path: z.string(),
  format: z.enum(['json', 'csv']).optional()
});

export const ConsoleWriterSchema = z.object({});

export const APIWriterSchema = z.object({
  url: z.string(),
  method: z.enum(['GET', 'POST']).optional(),
  headers: z.record(z.string()).optional()
});

export const MongoWriterSchema = z.object({
  uri: z.string(),
  database: z.string(),
  collection: z.string()
});

export const WriterSchemas = {
  MEMORY: MemoryWriterSchema,
  FILE: FileWriterSchema,
  CONSOLE: ConsoleWriterSchema,
  API: APIWriterSchema,
  MONGO: MongoWriterSchema
};