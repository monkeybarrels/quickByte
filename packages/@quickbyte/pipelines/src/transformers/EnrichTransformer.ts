import type { Transformer } from '../types';

/**
 * Options for configuring the EnrichTransformer
 * @interface EnrichTransformerOptions
 * @property {'http'} type - The type of enrichment to perform (currently only 'http' is supported)
 * @property {string} urlTemplate - Template string for the HTTP URL with variables in {{}} format
 * @property {Record<string, string>} [headers] - Optional HTTP headers to include in the request
 * @property {boolean} [merge] - Whether to merge the enriched data with the original data
 * @property {'skip' | 'fallback'} [onError] - How to handle errors during enrichment
 * @property {Record<string, any>} [fallback] - Fallback data to use when onError is 'fallback'
 */
interface EnrichTransformerOptions {
  type: 'http';
  urlTemplate: string;
  headers?: Record<string, string>;
  merge?: boolean;
  onError?: 'skip' | 'fallback';
  fallback?: Record<string, any>;
}

/**
 * Interpolates variables in a template string with values from a data object
 * @param {string} template - The template string containing variables in {{}} format
 * @param {Record<string, any>} row - The data object containing values to interpolate
 * @returns {string} The interpolated string with variables replaced by their values
 */
function interpolate(template: string, row: Record<string, any>): string {
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => row[key.trim()] ?? '');
}

/**
 * Creates a transformer that enriches data by making HTTP requests
 * @param {EnrichTransformerOptions} options - Configuration options for the transformer
 * @returns {Transformer} A transformer that enriches data through HTTP requests
 * @throws {Error} If an unsupported enrichment type is specified
 * 
 * @example
 * const transformer = EnrichTransformer({
 *   type: 'http',
 *   urlTemplate: 'https://api.example.com/users/{{id}}',
 *   headers: { 'Authorization': 'Bearer token' },
 *   merge: true,
 *   onError: 'fallback',
 *   fallback: { name: 'Unknown' }
 * });
 */
export const EnrichTransformer = (options: EnrichTransformerOptions): Transformer => {
  if (options.type !== 'http') {
    throw new Error(`Unsupported enrich type: ${options.type}`);
  }

  return {
    transform: async (data: Record<string, any>[]) => {
      try {
        const enrichedResults = await Promise.all(data.map(async (item) => {
          const url = interpolate(options.urlTemplate, item);
          const res = await fetch(url, { headers: options.headers });
          const enrichedData = await res.json() as Record<string, any>;
          return options.merge ? { ...item, ...enrichedData } : enrichedData;
        }));

        return enrichedResults;
      } catch (err) {
        if (options.onError === 'fallback') {
          return data.map(item => ({ ...item, ...(options.fallback ?? {}) }));
        } else if (options.onError === 'skip') {
          return data;
        } else {
          throw err;
        }
      }
    }
  };
};