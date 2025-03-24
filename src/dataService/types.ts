import { DynamicTransformerConfigUnion } from '../data/types';

export interface Transformer {
  id: string;
  name: string;
  description: string;
  config: DynamicTransformerConfigUnion;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransformerDto {
  name: string;
  description: string;
  config: DynamicTransformerConfigUnion;
}

export interface UpdateTransformerDto {
  name?: string;
  description?: string;
  config?: DynamicTransformerConfigUnion;
}
