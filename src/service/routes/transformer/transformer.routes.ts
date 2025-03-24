import { FastifyInstance } from 'fastify';
import { TransformerController } from '../../controllers/transformer/transformer.controller';

export default async function transformerRoutes(fastify: FastifyInstance) {
  const controller = new TransformerController();

  fastify.post('/transformers', {
    schema: {
      tags: ['transformers'],
      summary: 'Create a new transformer',
      body: {
        type: 'object',
        required: ['name', 'description', 'config'],
        properties: {
          name: { type: 'string' },
          description: { type: 'object' },
          config: { type: 'object' }
        }
      },
      response: {
        201: {
          description: 'Transformer created successfully',
          type: 'object'
        }
      }
    }
  }, controller.create.bind(controller));

  fastify.get('/transformers', {
    schema: {
      tags: ['transformers'],
      summary: 'Get all transformers',
      response: {
        200: {
          description: 'List of transformers',
          type: 'array',
          items: {
            type: 'object'
          }
        }
      }
    }
  }, controller.findAll.bind(controller));

  fastify.get('/transformers/:id', {
    schema: {
      tags: ['transformers'],
      summary: 'Get a transformer by ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          description: 'Transformer details',
          type: 'object'
        },
        404: {
          description: 'Transformer not found'
        }
      }
    }
  }, controller.findById.bind(controller));

  fastify.put('/transformers/:id', {
    schema: {
      tags: ['transformers'],
      summary: 'Update a transformer',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          config: { type: 'object' }
        }
      },
      response: {
        200: {
          description: 'Transformer updated successfully',
          type: 'object'
        },
        404: {
          description: 'Transformer not found'
        }
      }
    }
  }, controller.update.bind(controller));

  fastify.delete('/transformers/:id', {
    schema: {
      tags: ['transformers'],
      summary: 'Delete a transformer',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        204: {
          description: 'Transformer deleted successfully'
        },
        404: {
          description: 'Transformer not found'
        }
      }
    }
  }, controller.delete.bind(controller));
} 