<template>
  <div class="api-test-panel bg-white rounded-lg shadow-md p-6 mb-6">
    <h3 class="text-lg font-semibold mb-4 text-gray-800">🏠 Panel de Prueba API (Local)</h3>
    
    <!-- URL actual -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">URL API Local Actual:</label>
      <div class="bg-gray-100 p-2 rounded text-sm font-mono break-all">{{ currentUrl }}</div>
    </div>

    <!-- Botones de prueba -->
    <div class="flex gap-2 mb-4">
      <button 
        @click="testTimestamps" 
        :disabled="loading"
        class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300"
      >
        {{ loading ? 'Probando...' : 'Probar Timestamps' }}
      </button>
      <button 
        @click="testDetecciones" 
        :disabled="loading || !selectedTimestamp"
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
      >
        Probar Detecciones
      </button>
      <button 
        @click="clearCache"
        class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
      >
        Limpiar Cache
      </button>
    </div>

    <!-- Selector de timestamp -->
    <div v-if="timestamps.length > 0" class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Timestamp:</label>
      <select 
        v-model="selectedTimestamp"
        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
      >
        <option value="">Selecciona un timestamp...</option>
        <option v-for="timestamp in timestamps" :key="timestamp" :value="timestamp">
          {{ timestamp }}
        </option>
      </select>
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
import deteccionesService from '@/services/deteccionesService.js';

const loading = ref(false);
const status = ref(null);
const responseData = ref(null);
const currentUrl = ref('');
const timestamps = ref([]);
const selectedTimestamp = ref('');

const testTimestamps = async () => {
  loading.value = true;
  status.value = null;
  responseData.value = null;

  try {
    status.value = { type: 'info', message: 'Obteniendo timestamps de la API local...' };
    
    const data = await deteccionesService.fetchTimestamps();
    
    if (data.success && data.timestamps) {
      timestamps.value = data.timestamps;
      status.value = { 
        type: 'success', 
        message: `Timestamps obtenidos exitosamente! ${data.timestamps.length} timestamps disponibles.` 
      };
    } else {
      status.value = { 
        type: 'error', 
        message: 'No se pudieron obtener timestamps válidos.' 
      };
    }
    responseData.value = data;
    
  } catch (error) {
    status.value = { 
      type: 'error', 
      message: `Error obteniendo timestamps: ${error.message}` 
    };
    console.error('Error testing local API timestamps:', error);
  } finally {
    loading.value = false;
  }
};

const testDetecciones = async () => {
  if (!selectedTimestamp.value) return;
  
  loading.value = true;
  status.value = null;
  responseData.value = null;

  try {
    status.value = { type: 'info', message: `Obteniendo detecciones para ${selectedTimestamp.value}...` };
    
    const data = await deteccionesService.fetchDeteccionesPorTimestamp(selectedTimestamp.value);
    
    status.value = { 
      type: 'success', 
      message: `Detecciones obtenidas exitosamente! ${data.detecciones ? data.detecciones.length : 0} detecciones encontradas.` 
    };
    responseData.value = data;
    
  } catch (error) {
    status.value = { 
      type: 'error', 
      message: `Error obteniendo detecciones: ${error.message}` 
    };
    console.error('Error testing local API detecciones:', error);
  } finally {
    loading.value = false;
  }
};

const clearCache = () => {
  deteccionesService.invalidateCache();
  status.value = { type: 'info', message: 'Cache limpiado.' };
  responseData.value = null;
  timestamps.value = [];
  selectedTimestamp.value = '';
};

onMounted(() => {
  // Mostrar la URL que se está usando realmente
  if (process.env.NODE_ENV === 'development') {
    currentUrl.value = '/api/detecciones/timestamps (proxy a http://192.168.45.129:8080)';
  } else {
    currentUrl.value = 'http://192.168.45.129:8080/api/detecciones/timestamps';
  }
});
</script>
