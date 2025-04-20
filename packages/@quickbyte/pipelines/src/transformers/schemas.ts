// src/transformers/schemas.ts
import { z } from 'zod';

export const MapTransformerSchema = z.object({
  mappings: z.record(z.string())
});

export const FilterTransformerSchema = z.object({
  expression: z.string()
});

export const EnrichTransformerSchema = z.object({
  source: z.string(),
  lookupKey: z.string(),
  targetField: z.string()
});

export const FieldMappingTransformerSchema = z.object({
  mappings: z.record(z.string())
});

export const AddFieldTransformerSchema = z.object({
  field: z.string(),
  value: z.string()
});

export const TransformerSchemas = {
  MAP: MapTransformerSchema,
  FILTER: FilterTransformerSchema,
  ENRICH: EnrichTransformerSchema,
  FIELD_MAP: FieldMappingTransformerSchema,
  ADD_FIELD: AddFieldTransformerSchema
};