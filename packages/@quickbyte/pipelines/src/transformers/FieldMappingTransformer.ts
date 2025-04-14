import { Transformer } from '../types';

export class FieldMappingTransformer implements Transformer {
  private fieldMap: Record<string, string>;

  constructor(config: any) {
    this.fieldMap = config.fieldMap || {};
  }

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