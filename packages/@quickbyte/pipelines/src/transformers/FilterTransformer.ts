import { Transformer } from '../types';

export class FilterTransformer implements Transformer {
  private field: string;
  private operator: string;
  private value: any;

  constructor(config: any) {
    this.field = config.condition?.field || '';
    this.operator = config.condition?.operator || 'EQUALS';
    this.value = config.condition?.value;
  }

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

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => {
      if (acc && typeof acc === 'object' && part in acc) {
        return acc[part];
      }
      return undefined;
    }, obj);
  }
} 