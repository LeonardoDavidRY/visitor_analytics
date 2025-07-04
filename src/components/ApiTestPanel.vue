<template>
  <div class="api-test-panel bg-white rounded-lg shadow-md p-6 mb-6">
    <h3 class="text-lg font-semibold mb-4 text-gray-800">🔧 Panel de Prueba API</h3>
    
    <!-- URL actual -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">URL Actual:</label>
      <div class="bg-gray-100 p-2 rounded text-sm font-mono break-all">{{ currentUrl }}</div>
    </div>

    <!-- Actualizar URL -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Nueva URL (opcional):</label>
      <div class="flex gap-2">
        <input 
          v-model="newUrl" 
          type="text" 
          placeholder="https://nueva-url.ngrok-free.app/api"
          class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <button 
          @click="updateUrl"
          :disabled="!newUrl"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 text-sm"
        >
          Actualizar
        </button>
      </div>
    </div>

    <!-- Botones de prueba -->
    <div class="flex gap-2 mb-4">
      <button 
        @click="testConnection" 
        :disabled="loading"
        class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300"
      >
        {{ loading ? 'Probando...' : 'Probar Conexión' }}
      </button>
      <button 
        @click="clearCache"
        class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
      >
        Limpiar Cache
      </button>
    </div>

    <!-- Estado de la conexión -->
    <div v-if="status" class="mb-4">
      <div :class="[
        'p-3 rounded-md text-sm',
        status.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
        status.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 
        'bg-blue-100 text-blue-800 border border-blue-200'
      ]">
        <strong>{{ status.type === 'success' ? '✅' : status.type === 'error' ? '❌' : 'ℹ️' }}</strong>
        {{ status.message }}
      </div>
    </div>

    <!-- Vista previa de datos -->
    <div v-if="responseData" class="mt-4">
      <h4 class="font-medium text-gray-700 mb-2">Datos recibidos:</h4>
      <pre class="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">{{ JSON.stringify(responseData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiService from '@/services/apiService.js';

const loading = ref(false);
const status = ref(null);
const responseData = ref(null);
const currentUrl = ref('');
const newUrl = ref('');

const testConnection = async () => {
  loading.value = true;
  status.value = null;
  responseData.value = null;

  try {
    status.value = { type: 'info', message: 'Conectando con la API...' };
    
    const data = await apiService.fetchData();
    
    status.value = { 
      type: 'success', 
      message: `Conexión exitosa! Recibidos ${Object.keys(data).length} campos de datos.` 
    };
    responseData.value = data;
    
  } catch (error) {
    status.value = { 
      type: 'error', 
      message: `Error de conexión: ${error.message}` 
    };
    console.error('Error testing API:', error);
  } finally {
    loading.value = false;
  }
};

const updateUrl = () => {
  if (newUrl.value) {
    apiService.updateBaseUrl(newUrl.value);
    currentUrl.value = apiService.getCurrentUrl();
    status.value = { type: 'info', message: 'URL actualizada. Prueba la conexión nuevamente.' };
    newUrl.value = '';
  }
};

const clearCache = () => {
  apiService.invalidateCache();
  status.value = { type: 'info', message: 'Cache limpiado.' };
  responseData.value = null;
};

onMounted(() => {
  currentUrl.value = apiService.getCurrentUrl();
});
</script>
