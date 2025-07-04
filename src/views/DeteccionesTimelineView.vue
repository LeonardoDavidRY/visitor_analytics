<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Timeline de Detecciones</h1>
          <p class="text-gray-600 mt-2">Visualización temporal de las detecciones del sistema</p>
        </div>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div 
              :class="[
                'w-3 h-3 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-red-500'
              ]"
            ></div>
            <span class="text-sm text-gray-600">
              {{ isConnected ? 'API Conectada' : 'API Desconectada' }}
            </span>
          </div>
          <button 
            @click="refreshData" 
            :disabled="loading"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>{{ loading ? 'Actualizando...' : 'Actualizar' }}</span>
          </button>
        </div>
      </div>

      <!-- Estado de error global -->
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {{ error }}
      </div>

      <!-- Panel de información -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">ℹ️ Información del Timeline</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <strong>Fuente de datos:</strong><br>
            API de Detecciones (localhost:8080)
          </div>
          <div>
            <strong>Endpoint:</strong><br>
            /api/detecciones/timestamps
          </div>
          <div>
            <strong>Agrupación:</strong><br>
            Configurable por intervalos de tiempo
          </div>
        </div>
      </div>

      <!-- Componente principal -->
      <DeteccionesTimeline ref="timelineRef" />

      <!-- Información adicional -->
      <div class="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">📊 Detalles del Timeline</h3>
        <div class="prose max-w-none text-sm text-gray-600">
          <p>
            Este timeline muestra la actividad de detecciones agrupada por intervalos de tiempo configurables.
            Los datos se obtienen de la API de detecciones y se procesan para mostrar patrones temporales.
          </p>
          <ul class="mt-4 space-y-2">
            <li>• <strong>Intervalos:</strong> 1, 5, 10, 15, 30 minutos o 1 hora</li>
            <li>• <strong>Actualización:</strong> Manual o automática</li>
            <li>• <strong>Estadísticas:</strong> Total, hora pico, promedio por intervalo</li>
            <li>• <strong>Visualización:</strong> Gráfico de líneas interactivo</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DeteccionesTimeline from '@/components/charts/DeteccionesTimeline.vue';
import deteccionesService from '@/services/deteccionesService.js';

const loading = ref(false);
const error = ref(null);
const isConnected = ref(false);
const timelineRef = ref(null);

const refreshData = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Limpiar cache
    deteccionesService.invalidateAllCache();
    
    // Refrescar componente
    if (timelineRef.value && timelineRef.value.loadData) {
      await timelineRef.value.loadData();
    }
    
    isConnected.value = true;
  } catch (err) {
    error.value = 'Error al actualizar los datos del timeline';
    isConnected.value = false;
  } finally {
    loading.value = false;
  }
};

const checkConnection = async () => {
  try {
    const data = await deteccionesService.fetchTimestamps();
    isConnected.value = !!(data && data.success);
  } catch (err) {
    isConnected.value = false;
  }
};

onMounted(async () => {
  await checkConnection();
});
</script>
