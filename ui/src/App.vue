<template>
  <div class="app">
    <TransformerConfigBuilder />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TransformerConfigBuilder from './components/TransformerConfigBuilder.vue';

export default defineComponent({
  name: 'App',
  components: {
    TransformerConfigBuilder
  }
});
</script>

<style>
.app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style> 