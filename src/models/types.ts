import { DynamicTransformerConfigUnion } from '../data/types';

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