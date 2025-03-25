<template>
  <div class="transformer-config-builder">
    <h2>Transformer Configuration Builder</h2>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      Loading...
    </div>

    <!-- Error State -->
    <div v-if="error" class="error">
      {{ error }}
    </div>
    
    <!-- Transformer List -->
    <div class="transformers-list">
      <div v-for="(transformer, index) in transformers" :key="index" class="transformer-item">
        <div class="transformer-header">
          <h3>{{ transformer.name }}</h3>
          <div class="transformer-actions">
            <button @click="saveTransformer(transformer)" class="save-btn">Save</button>
            <button @click="removeTransformer(index)" class="delete-btn">Delete</button>
          </div>
        </div>
        
        <!-- Common Fields -->
        <div class="form-group">
          <label>Type:</label>
          <select :value="transformer.type" @change="(e) => onTypeChange(transformer, e.target.value)">
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
import { defineComponent, ref, onMounted } from 'vue';
import { DynamicTransformerConfigUnion, TransformerType, FilterOperator, MapOperation } from '@root/src/data/types';
import axios from 'axios';

export default defineComponent({
  name: 'TransformerConfigBuilder',
  setup() {
    const transformers = ref<DynamicTransformerConfigUnion[]>([]);
    const error = ref<string | null>(null);
    const loading = ref(false);

    // Fetch existing transformers on component mount
    onMounted(async () => {
      await fetchTransformers();
    });

    const fetchTransformers = async () => {
      try {
        loading.value = true;
        const response = await axios.get('/api/transformers');
        transformers.value = response.data;
      } catch (err) {
        error.value = 'Failed to load transformers';
        console.error('Error loading transformers:', err);
      } finally {
        loading.value = false;
      }
    };

    const saveTransformer = async (transformer: DynamicTransformerConfigUnion) => {
      try {
        loading.value = true;
        error.value = null;

        // Prepare the data to match the API schema
        const transformerData = {
          name: transformer.name,
          description: transformer.description,
          type: transformer.type,
          config: {}
        };

        // Set the config based on the transformer type
        switch (transformer.type) {
          case TransformerType.FIELD_MAPPING:
            transformerData.config = {
              fieldMap: transformer.fieldMap,
              dropUnmapped: transformer.dropUnmapped
            };
            break;
          case TransformerType.FILTER:
            transformerData.config = {
              field: transformer.field,
              operator: transformer.operator,
              value: transformer.value
            };
            break;
          case TransformerType.MAP:
            transformerData.config = {
              operations: transformer.operations
            };
            break;
        }

        if (transformer.id) {
          // Update existing transformer
          await axios.put(`/api/transformers/${transformer.id}`, transformerData);
        } else {
          // Create new transformer
          const response = await axios.post('/api/transformers', transformerData);
          const index = transformers.value.findIndex(t => t === transformer);
          if (index !== -1) {
            transformers.value[index] = response.data;
          }
        }
      } catch (err) {
        error.value = 'Failed to save transformer';
        console.error('Error saving transformer:', err);
      } finally {
        loading.value = false;
      }
    };

    const deleteTransformer = async (transformer: DynamicTransformerConfigUnion, index: number) => {
      try {
        loading.value = true;
        error.value = null;

        if (transformer.id) {
          await axios.delete(`/api/transformers/${transformer.id}`);
        }
        transformers.value.splice(index, 1);
      } catch (err) {
        error.value = 'Failed to delete transformer';
        console.error('Error deleting transformer:', err);
      } finally {
        loading.value = false;
      }
    };

    const createDefaultTransformer = (type: TransformerType): DynamicTransformerConfigUnion => {
      const base = {
        name: `Transformer ${transformers.value.length + 1}`,
        description: '',
        type,
        config: {}
      };

      switch (type) {
        case TransformerType.FIELD_MAPPING:
          return {
            ...base,
            type: TransformerType.FIELD_MAPPING,
            fieldMap: {},
            dropUnmapped: false,
            config: {
              fieldMap: {},
              dropUnmapped: false
            }
          };
        case TransformerType.FILTER:
          return {
            ...base,
            type: TransformerType.FILTER,
            field: '',
            operator: FilterOperator.EQUALS,
            value: '',
            config: {
              field: '',
              operator: FilterOperator.EQUALS,
              value: ''
            }
          };
        case TransformerType.MAP:
          return {
            ...base,
            type: TransformerType.MAP,
            operations: [],
            config: {
              operations: []
            }
          };
      }
    };

    const addTransformer = () => {
      const newTransformer = createDefaultTransformer(TransformerType.FIELD_MAPPING);
      transformers.value.push(newTransformer);
      saveTransformer(newTransformer);
    };

    const removeTransformer = async (index: number) => {
      const transformer = transformers.value[index];
      await deleteTransformer(transformer, index);
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

    const onTypeChange = async (transformer: DynamicTransformerConfigUnion, newType: TransformerType) => {
      const index = transformers.value.findIndex(t => t === transformer);
      if (index !== -1) {
        const newTransformer = createDefaultTransformer(newType);
        newTransformer.name = transformer.name;
        newTransformer.description = transformer.description;
        transformers.value[index] = newTransformer;
        await saveTransformer(newTransformer);
      }
    };

    return {
      transformers,
      error,
      loading,
      addTransformer,
      removeTransformer,
      addMapping,
      removeMapping,
      addOperation,
      removeOperation,
      copyToClipboard,
      saveTransformer,
      onTypeChange
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

.error {
  color: #ff4444;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ff4444;
  border-radius: 4px;
  background-color: #fff5f5;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.transformer-actions {
  display: flex;
  gap: 10px;
}

.save-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
}

.save-btn:hover {
  background-color: #1976D2;
}
</style> 