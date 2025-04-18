import { Transformer } from '../types';

/**
 * A transformer that filters records based on specified conditions.
 * Supports various comparison operators to filter data according to field values.
 */
export class FilterTransformer implements Transformer {
  private field: string;
  private operator: string;
  private value: any;

  /**
   * Creates a new FilterTransformer instance.
   * @param config - Configuration object containing filter conditions
   * @param config.condition - The filtering condition to apply
   * @param config.condition.field - The field path to filter on (supports dot notation for nested fields)
   * @param config.condition.operator - The comparison operator to use (EQUALS, NOT_EQUALS, GREATER_THAN, LESS_THAN, IN, NOT_IN, EXISTS)
   * @param config.condition.value - The value to compare against
   */
  constructor(config: any) {
    this.field = config.condition?.field || '';
    this.operator = config.condition?.operator || 'EQUALS';
    this.value = config.condition?.value;
  }

  /**
   * Transforms the input data by filtering records based on the configured condition.
   * @param data - Array of records to filter
   * @returns Promise resolving to the filtered array of records
   */
  async transform(data: any[]): Promise<any[]> {
    return data.filter(record => {
      const fieldValue = this.getValueByPath(record, this.field);
      
      switch (this.operator) {
        case 'EQUALS':
          return fieldValue === this.value;
        case 'NOT_EQUALS':
          return fieldValue !== this.value;
        case 'GREATER_THAN':
          return fieldValue > this.value;
        case 'LESS_THAN':
          return fieldValue < this.value;
        case 'IN':
          return Array.isArray(this.value) && this.value.includes(fieldValue);
        case 'NOT_IN':
          return Array.isArray(this.value) && !this.value.includes(fieldValue);
        case 'EXISTS':
          return fieldValue === true;
        default:
          return true;
      }
    });
  }

  /**
   * Retrieves a value from an object using a dot-notation path.
   * @param obj - The object to traverse
   * @param path - The dot-notation path to the desired value
   * @returns The value at the specified path, or undefined if not found
   */
  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => {
      if (acc && typeof acc === 'object' && part in acc) {
        return acc[part];
      }
      return undefined;
    }, obj);
  }
} 