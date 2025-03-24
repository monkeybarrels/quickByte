import { FastifyRequest, FastifyReply } from 'fastify';
import { transformerService } from '../../../dataService/services/transformer.service';
import { CreateTransformerDto, UpdateTransformerDto } from '../../../models/types';

export class TransformerController {
  async create(request: FastifyRequest<{ Body: CreateTransformerDto }>, reply: FastifyReply) {
    try {
      const transformer = await transformerService.create(request.body);
      return reply.status(201).send(transformer);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to create transformer' });
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const transformers = await transformerService.findAll();
      return reply.send(transformers);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to fetch transformers' });
    }
  }

  async findById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const transformer = await transformerService.findById(request.params.id);
      if (!transformer) {
        return reply.status(404).send({ error: 'Transformer not found' });
      }
      return reply.send(transformer);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to fetch transformer' });
    }
  }

  async update(request: FastifyRequest<{ Params: { id: string }, Body: UpdateTransformerDto }>, reply: FastifyReply) {
    try {
      const transformer = await transformerService.update(request.params.id, request.body);
      if (!transformer) {
        return reply.status(404).send({ error: 'Transformer not found' });
      }
      return reply.send(transformer);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to update transformer' });
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const success = await transformerService.delete(request.params.id);
      if (!success) {
        return reply.status(404).send({ error: 'Transformer not found' });
      }
      return reply.status(204).send();
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to delete transformer' });
    }
  }
} 