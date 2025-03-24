import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastify from 'fastify';
import { config } from './src/config';
import path from 'path';
import fastifyStatic from '@fastify/static';
import transformerRoutes from './src/service/routes/transformer/transformer.routes';
import { connectDB } from './src/dataService/db/connection';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

async function startServer() {
  // Connect to MongoDB
  await connectDB();

  const app: FastifyInstance = fastify();

  // Register Swagger
  await app.register(swagger, {
    swagger: {
      info: {
        title: 'QuickByte API',
        version: '1.0.0'
      },
      host: `${config.host}:${config.port}`,
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'transformers', description: 'Transformer endpoints' }
      ]
    }
  });

  await app.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    }
  });

  // API routes
  app.route({
    method: 'GET',
    url: '/api/health',
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return { status: 'ok' };
    }
  });

  // Register transformer routes
  await app.register(transformerRoutes, { prefix: '/api' });

  // Serve static files from the UI dist directory
  await app.register(fastifyStatic, {
    root: path.join(__dirname, 'ui/dist'),
    prefix: '/'
  });

  // Serve index.html for all other routes (SPA support)
  app.setNotFoundHandler((request, reply) => {
    return reply.sendFile('index.html');
  });

  try {
    await app.listen({ port: config.port, host: config.host });
    console.log(`Server is running on http://${config.host}:${config.port}`);
    console.log(`API documentation available at http://${config.host}:${config.port}/documentation`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

startServer();