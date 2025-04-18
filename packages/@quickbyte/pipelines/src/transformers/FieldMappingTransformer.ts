import { Transformer } from '../types';

/**
 * A transformer that maps fields from one structure to another based on a configuration.
 * This transformer allows for both simple field renaming and complex nested field mapping.
 * 
 * @example
 * ```typescript
 * const transformer = new FieldMappingTransformer({
 *   fieldMap: {
 *     'user.name': 'person.fullName',
 *     'user.age': 'person.details.age'
 *   }
 * });
 * ```
 */
export class FieldMappingTransformer implements Transformer {
  private fieldMap: Record<string, string>;

  /**
   * Creates a new FieldMappingTransformer instance.
   * 
   * @param config - Configuration object containing the field mapping rules
   * @param config.fieldMap - A record where keys are source field paths and values are target field paths
   *                         Field paths can be dot-notation strings for nested properties
   */
  constructor(config: any) {
    this.fieldMap = config.fieldMap || {};
  }

  /**
   * Transforms an array of records by applying the configured field mappings.
   * 
   * @param data - Array of records to transform
   * @returns Promise that resolves to an array of transformed records
   * 
   * @example
   * ```typescript
   * const result = await transformer.transform([
   *   { user: { name: 'John', age: 30 } }
   * ]);
   * // Result: [{ person: { fullName: 'John', details: { age: 30 } } }]
   * ```
   */
  async transform(data: any[]): Promise<any[]> {
    return data.map(record => {
      const result: Record<string, any> = {};
      
      for (const [from, to] of Object.entries(this.fieldMap)) {
        const fromParts = from.split('.');
        let value: any = record;
        
        // Navigate through nested properties
        for (const part of fromParts) {
          if (value && typeof value === 'object' && part in value) {
            value = value[part];
          } else {
            value = undefined;
            break;
          }
        }
        
        if (value !== undefined) {
          const toParts = to.split('.');
          let current = result;
          
          for (let i = 0; i < toParts.length - 1; i++) {
            const part = toParts[i];
            if (!current[part]) {
              current[part] = {};
            }
            current = current[part];
          }
          
          current[toParts[toParts.length - 1]] = value;
        }
      }
      
      return result;
    });
  }
} 