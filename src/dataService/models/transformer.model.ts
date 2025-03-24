import mongoose, { Schema, Document } from 'mongoose';
import { DynamicTransformerConfigUnion } from '../../data/types';

export interface ITransformer extends Document {
  name: string;
  description: string;
  config: DynamicTransformerConfigUnion;
  createdAt: Date;
  updatedAt: Date;
}

const TransformerSchema = new Schema<ITransformer>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  config: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
TransformerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const TransformerModel = mongoose.model<ITransformer>('Transformer', TransformerSchema); 