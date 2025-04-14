import { Transformer } from '../types';

export class AddFieldTransformer implements Transformer {
  private field: string;
  private value: any;

  constructor(config: any) {
    this.field = config.field || '';
    this.value = config.value;
  }

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