import { Transformer } from '../types';

/**
 * A transformer that adds a new field with a specified value to each record in the data.
 * Supports nested field paths using dot notation (e.g., 'user.address.city').
 */
export class AddFieldTransformer implements Transformer {
  private field: string;
  private value: any;

  /**
   * Creates a new AddFieldTransformer instance.
   * @param config - Configuration object for the transformer
   * @param config.field - The field name to add. Can be a nested path using dot notation (e.g., 'user.address.city')
   * @param config.value - The value to set for the new field
   */
  constructor(config: any) {
    this.field = config.field || '';
    this.value = config.value;
  }

  /**
   * Transforms the input data by adding the specified field to each record.
   * @param data - Array of records to transform
   * @returns Promise that resolves to the transformed data with the new field added
   */
  async transform(data: any[]): Promise<any[]> {
    return data.map(record => {
      const result = { ...record };
      
      if (this.field.includes('.')) {
        const parts = this.field.split('.');
        let current = result;
        
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
        
        current[parts[parts.length - 1]] = this.value;
      } else {
        result[this.field] = this.value;
      }
      
      return result;
    });
  }
} 