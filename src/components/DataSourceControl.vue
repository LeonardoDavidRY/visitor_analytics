<template>
  <div class="bg-white rounded-lg shadow-lg p-4 mb-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <h3 class="text-lg font-semibold text-gray-800">Fuente de Datos</h3>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600">Local</span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="useAPI"
              @change="handleToggle"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
          <span class="text-sm text-gray-600">API</span>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2">
          <div 
            :class="[
              'w-3 h-3 rounded-full',
              apiStatus ? 'bg-green-500' : 'bg-red-500'
            ]"
          ></div>
          <span class="text-sm text-gray-600">
            API {{ apiStatus ? 'Conectada' : 'Desconectada' }}
          </span>
        </div>
        
        <button
          @click="checkAPIStatus"
          :disabled="checking"
          class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ checking ? 'Verificando...' : 'Verificar API' }}
        </button>
      </div>
    </div>
    
    <div v-if="!apiStatus && useAPI" class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
      <p class="text-sm text-yellow-800">
        ⚠️ La API no está disponible. Los datos locales se usarán automáticamente como respaldo.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import hybridDataService from '@/services/hybridDataService.js';

const useAPI = ref(true);
const apiStatus = ref(false);
const checking = ref(false);

const checkAPIStatus = async () => {
  checking.value = true;
  try {
    apiStatus.value = await hybridDataService.checkAPIStatus();
  } catch (error) {
    apiStatus.value = false;
  } finally {
    checking.value = false;
  }
};

const handleToggle = () => {
  hybridDataService.setDataSource(useAPI.value);
  // Emitir evento para que los componentes padre puedan recargar datos
  // En una implementación más robusta, podrías usar un store global
  window.dispatchEvent(new CustomEvent('dataSourceChanged'));
};

onMounted(() => {
  checkAPIStatus();
  
  // Verificar estado de la API cada 30 segundos
  setInterval(checkAPIStatus, 30000);
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
