import { Transformer } from '../types';

/**
 * A transformer that applies various mapping operations to fields in the data records.
 * Supports operations like case conversion, type conversion, trimming, and JSON parsing.
 */
export class MapTransformer implements Transformer {
  /**
   * Array of mapping operations to be applied to the data
   * @private
   */
  private operations: Array<{
    field: string;
    operation: string;
    options?: Record<string, any>;
  }>;

  /**
   * Creates a new MapTransformer instance
   * @param config - Configuration object containing the operations to apply
   * @param config.operations - Array of mapping operations to be applied
   */
  constructor(config: any) {
    this.operations = config.operations || [];
  }

  /**
   * Transforms the input data by applying the configured mapping operations to each record
   * @param data - Array of records to transform
   * @returns Promise resolving to the transformed data
   * 
   * Supported operations:
   * - TO_UPPER_CASE: Converts string to uppercase
   * - TO_LOWER_CASE: Converts string to lowercase
   * - TRIM: Removes whitespace from both ends of string
   * - NUMBER: Converts to number
   * - STRING: Converts to string
   * - BOOLEAN: Converts to boolean
   * - PARSE_JSON: Parses JSON string to object
   * - STRINGIFY_JSON: Converts object to JSON string
   */
  async transform(data: any[]): Promise<any[]> {
    return data.map(record => {
      const result = { ...record };
      
      for (const op of this.operations) {
        const { field, operation, options } = op;
        
        if (field in result) {
          switch (operation) {
            case 'TO_UPPER_CASE':
              result[field] = String(result[field]).toUpperCase();
              break;
            case 'TO_LOWER_CASE':
              result[field] = String(result[field]).toLowerCase();
              break;
            case 'TRIM':
              result[field] = String(result[field]).trim();
              break;
            case 'NUMBER':
              result[field] = Number(result[field]);
              break;
            case 'STRING':
              result[field] = String(result[field]);
              break;
            case 'BOOLEAN':
              result[field] = result[field] === 'true' || result[field] === true;
              break;
            case 'PARSE_JSON':
              try {
                result[field] = JSON.parse(result[field]);
              } catch (e) {
                console.warn(`Failed to parse JSON for field ${field}:`, e);
              }
              break;
            case 'STRINGIFY_JSON':
              result[field] = JSON.stringify(result[field]);
              break;
            default:
              console.warn(`Unknown operation: ${operation}`);
          }
        }
      }
      
      return result;
    });
  }
} 