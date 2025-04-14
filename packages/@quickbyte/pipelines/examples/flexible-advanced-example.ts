import { FlexiblePipeline, defaultRegistry, Reader, Transformer, Writer } from '../src';

/**
 * Advanced example demonstrating the flexibility of the new pipeline approach
 */
async function runFlexibleAdvancedExample(): Promise<void> {
  try {
    // Example 1: Using the registry to create components
    console.log('Example 1: Using the registry to create components');
    const registryExample = await runRegistryExample();
    console.log('Registry example completed');
    
    // Example 2: Creating custom components
    console.log('\nExample 2: Creating custom components');
    const customExample = await runCustomComponentsExample();
    console.log('Custom components example completed');
    
    // Example 3: Composing pipelines
    console.log('\nExample 3: Composing pipelines');
    const composedExample = await runComposedPipelinesExample();
    console.log('Composed pipelines example completed');
  } catch (error) {
    console.error('Failed to run flexible advanced example:', error);
  }
}

/**
 * Example 1: Using the registry to create components
 */
async function runRegistryExample(): Promise<void> {
  // Create a pipeline using the registry
  const config = {
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
    transformers: [
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
    writer: defaultRegistry.createWriter({
      type: 'CSV',
      location: 'examples/configs/output/registry-example.csv',
      options: {
        delimiter: ',',
        headers: true,
        columns: ['title', 'description', 'id', 'publishedAt', 'processedAt']
      }
    })
  };
  
  const pipeline = new FlexiblePipeline(config);
  await pipeline.run();
}

/**
 * Example 2: Creating custom components
 */
async function runCustomComponentsExample(): Promise<void> {
  // Create a custom reader
  const customReader: Reader = {
    async read(): Promise<any[]> {
      // Return some sample data
      return [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
        { id: 3, name: 'Item 3', value: 300 }
      ];
    }
  };
  
  // Create a custom transformer
  const customTransformer: Transformer = {
    async transform(data: any[]): Promise<any[]> {
      // Double the value field
      return data.map(item => ({
        ...item,
        value: item.value * 2
      }));
    }
  };
  
  // Create a custom writer
  const customWriter: Writer = {
    async write(data: any[]): Promise<void> {
      // Just log the data
      console.log('Custom writer output:', data);
    }
  };
  
  // Create a pipeline with custom components
  const config = {
    reader: customReader,
    transformers: [customTransformer],
    writer: customWriter
  };
  
  const pipeline = new FlexiblePipeline(config);
  await pipeline.run();
}

/**
 * Example 3: Composing pipelines
 */
async function runComposedPipelinesExample(): Promise<void> {
  // Create a reader that reads from an API
  const apiReader = defaultRegistry.createReader({
    type: 'API',
    location: 'http://localhost:1337/api/articles',
    options: {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      responsePath: 'data'
    }
  });
  
  // Create a transformer that extracts specific fields
  const fieldExtractor = defaultRegistry.createTransformer({
    type: 'FIELD_MAPPING',
    fieldMap: {
      'id': 'id',
      'title': 'title',
      'description': 'description',
      'publishedAt': 'publishedAt'
    }
  });
  
  // Create a transformer that adds a timestamp
  const timestampAdder = defaultRegistry.createTransformer({
    type: 'ADD_FIELD',
    field: 'processedAt',
    value: '2024-03-14T12:00:00Z'
  });
  
  // Create a transformer that filters items
  const filter = defaultRegistry.createTransformer({
    type: 'FILTER',
    condition: {
      field: 'id',
      operator: 'GREATER_THAN',
      value: 7
    }
  });
  
  // Create a writer that writes to CSV
  const csvWriter = defaultRegistry.createWriter({
    type: 'CSV',
    location: 'examples/configs/output/composed-example.csv',
    options: {
      delimiter: ',',
      headers: true,
      columns: ['title', 'description', 'id', 'publishedAt', 'processedAt']
    }
  });
  
  // Create a writer that writes to memory (for demonstration)
  const memoryWriter = defaultRegistry.createWriter({
    type: 'MEMORY'
  });
  
  // Create two different pipelines using the same components
  const pipeline1 = new FlexiblePipeline({
    reader: apiReader,
    transformers: [fieldExtractor, timestampAdder],
    writer: csvWriter
  });
  
  const pipeline2 = new FlexiblePipeline({
    reader: apiReader,
    transformers: [fieldExtractor, timestampAdder, filter],
    writer: memoryWriter
  });
  
  // Run both pipelines
  await pipeline1.run();
  await pipeline2.run();
  
  // Get the data from the memory writer
  const memoryData = (memoryWriter as any).getData();
  console.log('Memory writer data:', memoryData);
}

// Run the advanced example
runFlexibleAdvancedExample(); 