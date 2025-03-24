import { CreateTransformerDto, UpdateTransformerDto } from '../../models/types';
import { TransformerModel, ITransformer } from '../models/transformer.model';

class TransformerService {
  async create(dto: CreateTransformerDto): Promise<ITransformer> {
    const transformer = new TransformerModel(dto);
    return await transformer.save();
  }

  async findAll(): Promise<ITransformer[]> {
    return await TransformerModel.find().sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<ITransformer | null> {
    return await TransformerModel.findById(id);
  }

  async update(id: string, dto: UpdateTransformerDto): Promise<ITransformer | null> {
    return await TransformerModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await TransformerModel.findByIdAndDelete(id);
    return result !== null;
  }
}

export const transformerService = new TransformerService(); 