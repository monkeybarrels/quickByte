import { createApiReader } from '../src/data/readers/api.reader';
import { createCsvWriter } from '../src/data/writers/csv.writer';
import { DataSource, SourceConfig, TransformerType, MapOperation, FilterOperator } from '../src/data/types';
import { createMapTransformer, createFilterTransformer } from '../src/data/transformers/base.transformers';
import { createTransformerPipeline } from '../src/data/transformers/pipeline';

// Define the type for our API response
interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

// Define the type for our transformed post
interface TransformedPost extends Post {
  timestamp: string;
}

async function fetchAndSaveToJson() {
  try {
    // Create an API reader to fetch posts
    const apiReader = createApiReader<Post>({
      url: 'https://jsonplaceholder.typicode.com/posts',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    // Create a file writer to save the posts
    const fileWriter = createCsvWriter<TransformedPost>({
      type: DataSource.FILE,
      options: {
        path: './data/output/posts.csv',
        encoding: 'utf-8',
        columns: ['id', 'userId', 'title', 'body', 'timestamp']
      }
    });

    // Create transformers
    const titleTransformer = createMapTransformer<Post, Post>({
      name: 'titleTransformer',
      description: 'Converts title to uppercase',
      field: 'title',
      operation: MapOperation.TO_UPPER_CASE,
      transform: (post) => ({
        ...post,
        title: post.title.replaceAll('\n',' ').toUpperCase()
      })
    });

    const timestampTransformer = createMapTransformer<Post, TransformedPost>({
      name: 'timestampTransformer',
      description: 'Adds timestamp to each post',
      field: 'timestamp',
      operation: MapOperation.STRING,
      transform: (post) => ({
        ...post,
        timestamp: new Date().toISOString(),
        body: post.body.replaceAll('\n',' ')
      })
    });

    const filterTransformer = createFilterTransformer<TransformedPost>({
      name: 'idFilter',
      description: 'Filters posts with ID <= 50',
      field: 'id',
      operator: FilterOperator.LESS_THAN_EQUALS,
      value: 50,
      predicate: (post) => post.id <= 50
    });

    // Create a pipeline of transformers
    const transformerPipeline = createTransformerPipeline<Post, TransformedPost>([
      titleTransformer,
      timestampTransformer,
      filterTransformer
    ]);

    // Read data from the API
    const sourceConfig: SourceConfig = {
      type: DataSource.API,
      location: 'https://jsonplaceholder.typicode.com/posts'
    };
    const posts = await apiReader.read(sourceConfig);

    // Transform the data
    const transformedPosts = transformerPipeline.transformBatch(posts);

    // Write the data to a JSON file
    await fileWriter.write(transformedPosts, {
      type: DataSource.FILE,
      options: {
        path: './data/output/posts.csv',
        encoding: 'utf-8'
      }
    });

    console.log(`Successfully saved ${transformedPosts.length} transformed posts to ./data/output/posts.json`);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Run the example
fetchAndSaveToJson()
  .then(() => console.log('Example completed successfully'))
  .catch(() => console.error('Example failed'));
