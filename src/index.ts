import { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import { config } from './config';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

/**
 * Main entry point for the QuickByte package
 */
export class QuickByte {
  private server: FastifyInstance;

  constructor() {
    this.server = fastify();
  }

  /**
   * Initializes the QuickByte server with basic configuration
   */
  async initialize(): Promise<void> {
    // Register Swagger
    await this.server.register(swagger, {
      openapi: {
        info: {
          title: 'QuickByte API',
          version: '1.0.0'
        },
        servers: [{
          url: `http://${config.host}:${config.port}`
        }]
      }
    });

    await this.server.register(swaggerUi, {
      routePrefix: '/documentation',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false
      }
    });

    // Basic health check route
    this.server.route({
      method: 'GET',
      url: '/api/health',
      handler: async (request, reply) => {
        return { status: 'ok' };
      }
    });
  }

  /**
   * Starts the QuickByte server
   * @param port - Port to listen on (default: 3000)
   * @param host - Host to listen on (default: '0.0.0.0')
   */
  async start(port: number = config.port, host: string = config.host): Promise<void> {
    try {
      await this.server.listen({ port, host });
      console.log(`Server is running on http://${host}:${port}`);
      console.log(`API documentation available at http://${host}:${port}/documentation`);
    } catch (err) {
      console.error('Error starting server:', err);
      process.exit(1);
    }
  }

  /**
   * Stops the QuickByte server
   */
  async stop(): Promise<void> {
    await this.server.close();
  }
}

// Export the main class
export default QuickByte; 