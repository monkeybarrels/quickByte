<template>
  <div class="transformer-config-builder">
    <h2>Transformer Configuration Builder</h2>
    
    <!-- Transformer List -->
    <div class="transformers-list">
      <div v-for="(transformer, index) in transformers" :key="index" class="transformer-item">
        <div class="transformer-header">
          <h3>{{ transformer.name }}</h3>
          <button @click="removeTransformer(index)" class="delete-btn">Delete</button>
        </div>
        
        <!-- Common Fields -->
        <div class="form-group">
          <label>Type:</label>
          <select v-model="transformer.type">
            <option value="FIELD_MAPPING">Field Mapping</option>
            <option value="FILTER">Filter</option>
            <option value="MAP">Map</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Name:</label>
          <input v-model="transformer.name" type="text" />
        </div>
        
        <div class="form-group">
          <label>Description:</label>
          <textarea v-model="transformer.description"></textarea>
        </div>

        <!-- Type-specific Fields -->
        <div v-if="transformer.type === 'FIELD_MAPPING'" class="type-specific">
          <div class="form-group">
            <label>Field Mappings:</label>
            <div v-for="(value, key) in transformer.fieldMap" :key="key" class="mapping-item">
              <input v-model="transformer.fieldMap[key]" :placeholder="key" />
              <button @click="removeMapping(transformer, key)" class="delete-btn">×</button>
            </div>
            <button @click="addMapping(transformer)" class="add-btn">Add Mapping</button>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="transformer.dropUnmapped" />
              Drop Unmapped Fields
            </label>
          </div>
        </div>

        <div v-if="transformer.type === 'FILTER'" class="type-specific">
          <div class="form-group">
            <label>Field:</label>
            <input v-model="transformer.field" type="text" />
          </div>
          <div class="form-group">
            <label>Operator:</label>
            <select v-model="transformer.operator">
              <option value="EQUALS">Equals</option>
              <option value="NOT_EQUALS">Not Equals</option>
              <option value="GREATER_THAN">Greater Than</option>
              <option value="LESS_THAN">Less Than</option>
              <option value="CONTAINS">Contains</option>
            </select>
          </div>
          <div class="form-group">
            <label>Value:</label>
            <input v-model="transformer.value" type="text" />
          </div>
        </div>

        <div v-if="transformer.type === 'MAP'" class="type-specific">
          <div class="form-group">
            <label>Operations:</label>
            <div v-for="(op, opIndex) in transformer.operations" :key="opIndex" class="operation-item">
              <select v-model="op.field">
                <option value="email">Email</option>
                <option value="age">Age</option>
                <option value="status">Status</option>
              </select>
              <select v-model="op.operation">
                <option value="TO_LOWER_CASE">To Lower Case</option>
                <option value="NUMBER">To Number</option>
                <option value="STRING">To String</option>
              </select>
              <button @click="removeOperation(transformer, opIndex)" class="delete-btn">×</button>
            </div>
            <button @click="addOperation(transformer)" class="add-btn">Add Operation</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add New Transformer Button -->
    <button @click="addTransformer" class="add-btn">Add Transformer</button>

    <!-- Export Configuration -->
    <div class="export-section">
      <h3>Export Configuration</h3>
      <pre>{{ JSON.stringify(transformers, null, 2) }}</pre>
      <button @click="copyToClipboard" class="copy-btn">Copy to Clipboard</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { DynamicTransformerConfigUnion, TransformerType, FilterOperator, MapOperation } from '../data/types';

export default defineComponent({
  name: 'TransformerConfigBuilder',
  setup() {
    const transformers = ref<DynamicTransformerConfigUnion[]>([]);

    const addTransformer = () => {
      transformers.value.push({
        type: TransformerType.FIELD_MAPPING,
        name: `Transformer ${transformers.value.length + 1}`,
        description: '',
        fieldMap: {},
        dropUnmapped: false
      });
    };

    const removeTransformer = (index: number) => {
      transformers.value.splice(index, 1);
    };

    const addMapping = (transformer: DynamicTransformerConfigUnion) => {
      if (transformer.type === TransformerType.FIELD_MAPPING) {
        const newKey = `field${Object.keys(transformer.fieldMap).length + 1}`;
        transformer.fieldMap[newKey] = '';
      }
    };

    const removeMapping = (transformer: DynamicTransformerConfigUnion, key: string) => {
      if (transformer.type === TransformerType.FIELD_MAPPING) {
        delete transformer.fieldMap[key];
      }
    };

    const addOperation = (transformer: DynamicTransformerConfigUnion) => {
      if (transformer.type === TransformerType.MAP) {
        transformer.operations.push({
          field: 'email',
          operation: MapOperation.TO_LOWER_CASE
        });
      }
    };

    const removeOperation = (transformer: DynamicTransformerConfigUnion, index: number) => {
      if (transformer.type === TransformerType.MAP) {
        transformer.operations.splice(index, 1);
      }
    };

    const copyToClipboard = () => {
      navigator.clipboard.writeText(JSON.stringify(transformers.value, null, 2));
      alert('Configuration copied to clipboard!');
    };

    return {
      transformers,
      addTransformer,
      removeTransformer,
      addMapping,
      removeMapping,
      addOperation,
      removeOperation,
      copyToClipboard
    };
  }
});
</script>

<style scoped>
.transformer-config-builder {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.transformer-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}

.transformer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.mapping-item,
.operation-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.delete-btn {
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
}

.add-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  margin-top: 10px;
}

.export-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.export-section pre {
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

.copy-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  margin-top: 10px;
}
</style> 