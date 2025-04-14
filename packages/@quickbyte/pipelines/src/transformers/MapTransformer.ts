import { Transformer } from '../types';

export class MapTransformer implements Transformer {
  private operations: Array<{
    field: string;
    operation: string;
    options?: Record<string, any>;
  }>;

  constructor(config: any) {
    this.operations = config.operations || [];
  }

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