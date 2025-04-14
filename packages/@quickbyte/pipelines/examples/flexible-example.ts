import { FlexiblePipeline, defaultRegistry } from '../src';

/**
 * Example demonstrating how to use the flexible pipeline
 */
async function runFlexibleExample(): Promise<void> {
  try {
    // Create a pipeline configuration
    const config = {
      // Create a reader from the registry
      reader: defaultRegistry.createReader({
        type: 'API',
        location: 'http://localhost:1337/api/articles',
        options: {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          responsePath: 'data'
        }
      }),
      
      // Create transformers from the registry
      transformers: [
        defaultRegistry.createTransformer({
          type: 'MAP',
          operations: [
            {
              field: 'data',
              operation: 'PARSE_JSON'
            }
          ]
        }),
        defaultRegistry.createTransformer({
          type: 'FIELD_MAPPING',
          fieldMap: {
            'id': 'id',
            'title': 'title',
            'description': 'description',
            'publishedAt': 'publishedAt'
          }
        }),
        defaultRegistry.createTransformer({
          type: 'ADD_FIELD',
          field: 'processedAt',
          value: '2024-03-14T12:00:00Z'
        })
      ],
      
      // Create a writer from the registry
      writer: defaultRegistry.createWriter({
        type: 'CSV',
        location: 'examples/configs/output/flexible-api-data.csv',
        options: {
          delimiter: ',',
          headers: true,
          columns: ['title', 'description', 'id', 'publishedAt', 'processedAt']
        }
      })
    };
    
    // Create and run the pipeline
    console.log('Running flexible pipeline example');
    const pipeline = new FlexiblePipeline(config);
    await pipeline.run();
    console.log('Flexible pipeline completed successfully');
  } catch (error) {
    console.error('Failed to run flexible pipeline example:', error);
  }
}

// Run the example
runFlexibleExample(); 