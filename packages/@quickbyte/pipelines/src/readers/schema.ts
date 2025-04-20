// src/readers/schemas.ts
import { z } from 'zod';

export const CSVReaderSchema = z.object({
  path: z.string(),
  delimiter: z.string().optional(),
  headers: z.boolean().optional()
});

export const JSONReaderSchema = z.object({
  path: z.string()
});

export const MongoReaderSchema = z.object({
  uri: z.string(),
  database: z.string(),
  collection: z.string()
});

export const MemoryReaderSchema = z.object({
  data: z.array(z.any())
});

export const ApiReaderSchema = z.object({
  url: z.string(),
  method: z.enum(['GET', 'POST']).optional(),
  headers: z.record(z.string()).optional()
});


export const FileReaderSchema = z.object({
  path: z.string(),
  format: z.enum(['json', 'csv']).optional()
});



export const ReaderSchemas = {
  CSV: CSVReaderSchema,
  JSON: JSONReaderSchema,
  MONGO: MongoReaderSchema,
  MEMORY: MemoryReaderSchema,
  API: ApiReaderSchema,
  FILE: FileReaderSchema
};


