import { TransformationPlugin, PluginRegistry } from '../types';

export class QuickBytePluginRegistry implements PluginRegistry {
  private plugins: Map<string, TransformationPlugin> = new Map();

  registerPlugin(plugin: TransformationPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }
    this.plugins.set(plugin.name, plugin);
  }

  getPlugin(name: string): TransformationPlugin | undefined {
    return this.plugins.get(name);
  }

  listPlugins(): TransformationPlugin[] {
    return Array.from(this.plugins.values());
  }
}

// Export a singleton instance
export const pluginRegistry = new QuickBytePluginRegistry(); 