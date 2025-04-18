import { defaultRegistry } from './registry';
import { MemoryWriter } from './writers';
import { WriterFactory, TransformerFactory } from './types';

/**
 * Register all components with the default registry
 */
export function registerDefaultComponents(): void {
  // Register default writers
  defaultRegistry.registerWriter('MEMORY', (config) => new MemoryWriter());
}

export function registerWriter(type: string, factory: WriterFactory): void {
  defaultRegistry.registerWriter(type, factory);
}

export function registerTransformer(type: string, factory: TransformerFactory): void {
  defaultRegistry.registerTransformer(type, factory);
} 