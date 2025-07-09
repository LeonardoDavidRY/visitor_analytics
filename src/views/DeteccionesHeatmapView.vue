<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            Mapa de Calor - Coordenadas
          </h1>
          <p class="text-gray-600 mt-2">
            Visualización espacial de las detecciones por coordenadas
          </p>
        </div>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div
              :class="[
                'w-3 h-3 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-red-500',
              ]"
            ></div>
            <span class="text-sm text-gray-600">
              {{
                dataSourceInfo.isMock
                  ? 'Datos Mock Cargados'
                  : isConnected
                  ? 'API Conectada'
                  : 'API Desconectada'
              }}
            </span>
          </div>
          <button
            @click="refreshData"
            :disabled="loading"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            <span>{{ loading ? 'Actualizando...' : 'Actualizar' }}</span>
          </button>
        </div>
      </div>

      <!-- Estado de error global -->
      <div
        v-if="error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
      >
        {{ error }}
      </div>

      <!-- Componente principal -->
      <DeteccionesHeatmap ref="heatmapRef" />

      <!-- Leyenda de colores -->
      <div class="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">
          🎨 Leyenda de Colores
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-blue-200 rounded"></div>
            <span>Densidad baja</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-yellow-400 rounded"></div>
            <span>Densidad media</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-red-500 rounded"></div>
            <span>Densidad alta</span>
          </div>
          <div class="flex items-center space-x-2">
            <div
              class="w-4 h-4 bg-gray-800 border-2 border-white rounded"
            ></div>
            <span>Puntos individuales</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DeteccionesHeatmap from '@/components/charts/DeteccionesHeatmap.vue';
import {
  getDeteccionesService,
  getDataSourceInfo,
} from '@/config/deteccionesConfig.js';

const loading = ref(false);
const error = ref(null);
const isConnected = ref(false);
const heatmapRef = ref(null);

// Servicio de detecciones (se cargará dinámicamente)
let deteccionesService = null;

// Información del origen de datos
const dataSourceInfo = getDataSourceInfo();

const refreshData = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Obtener servicio si no está cargado
    if (!deteccionesService) {
      deteccionesService = await getDeteccionesService();
    }

    // Limpiar cache si es un servicio real
    if (deteccionesService.invalidateAllCache) {
      deteccionesService.invalidateAllCache();
    }

    // Refrescar componente
    if (heatmapRef.value && heatmapRef.value.loadTimestamps) {
      await heatmapRef.value.loadTimestamps();
    }

    isConnected.value = true;
  } catch (err) {
    error.value = 'Error al actualizar los datos del mapa de calor';
    isConnected.value = false;
  } finally {
    loading.value = false;
  }
};

const checkConnection = async () => {
  try {
    if (!deteccionesService) {
      deteccionesService = await getDeteccionesService();
    }

    if (dataSourceInfo.isMock) {
      // Para datos mock, siempre está "conectado"
      isConnected.value = true;
    } else {
      // Para API real, verificar conexión
      const data = await deteccionesService.fetchTimestamps();
      isConnected.value = !!(data && data.success);
    }
  } catch (err) {
    isConnected.value = false;
  }
};

onMounted(async () => {
  await checkConnection();
});
</script>
