<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Sistema de Detecciones</h1>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div 
              :class="[
                'w-3 h-3 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-red-500'
              ]"
            ></div>
            <span class="text-sm text-gray-600">
              {{ isConnected ? 'Conectado' : 'Desconectado' }}
            </span>
          </div>
          <button 
            @click="refreshAll" 
            :disabled="loading"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>{{ loading ? 'Actualizando...' : 'Actualizar Todo' }}</span>
          </button>
        </div>
      </div>

      <!-- Estado de error global -->
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {{ error }}
      </div>

      <!-- Panel de prueba de API -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">🔧 Panel de Prueba - Detecciones API</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button 
            @click="testTimestamps"
            :disabled="loading"
            class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300"
          >
            {{ loading ? 'Probando...' : 'Probar Timestamps' }}
          </button>
          <button 
            @click="testDetecciones"
            :disabled="loading"
            class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300"
          >
            {{ loading ? 'Probando...' : 'Probar Detecciones' }}
          </button>
        </div>

        <div v-if="testResult" class="mt-4">
          <div :class="[
            'p-3 rounded-md text-sm',
            testResult.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          ]">
            <strong>{{ testResult.type === 'success' ? '✅' : '❌' }}</strong>
            {{ testResult.message }}
          </div>
        </div>
      </div>

      <!-- Componentes de detecciones -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <!-- Timeline de detecciones -->
        <div class="xl:col-span-2">
          <DeteccionesTimeline ref="timelineRef" />
        </div>
        
        <!-- Mapa de calor de coordenadas -->
        <div class="xl:col-span-2">
          <DeteccionesHeatmap ref="heatmapRef" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DeteccionesTimeline from '@/components/charts/DeteccionesTimeline.vue';
import DeteccionesHeatmap from '@/components/charts/DeteccionesHeatmap.vue';
import deteccionesService from '@/services/deteccionesService.js';

const loading = ref(false);
const error = ref(null);
const isConnected = ref(false);
const testResult = ref(null);
const timelineRef = ref(null);
const heatmapRef = ref(null);

const testTimestamps = async () => {
  loading.value = true;
  testResult.value = null;

  try {
    const data = await deteccionesService.fetchTimestamps();
    
    if (data.success) {
      testResult.value = {
        type: 'success',
        message: `Conexión exitosa! Encontrados ${data.total} timestamps.`
      };
      isConnected.value = true;
    } else {
      testResult.value = {
        type: 'error',
        message: 'La API respondió pero sin datos válidos.'
      };
      isConnected.value = false;
    }
  } catch (error) {
    testResult.value = {
      type: 'error',
      message: `Error de conexión: ${error.message}`
    };
    isConnected.value = false;
  } finally {
    loading.value = false;
  }
};

const testDetecciones = async () => {
  loading.value = true;
  testResult.value = null;

  try {
    // Primero obtener un timestamp para probar
    const timestampsData = await deteccionesService.fetchTimestamps();
    
    if (!timestampsData.success || timestampsData.timestamps.length === 0) {
      testResult.value = {
        type: 'error',
        message: 'No hay timestamps disponibles para probar detecciones.'
      };
      return;
    }

    const testTimestamp = timestampsData.timestamps[0];
    const detecciones = await deteccionesService.fetchDeteccionesPorTimestamp(testTimestamp);
    
    if (detecciones.success) {
      testResult.value = {
        type: 'success',
        message: `Detecciones obtenidas! ${detecciones.total_encontradas} detecciones para ${testTimestamp}.`
      };
      isConnected.value = true;
    } else {
      testResult.value = {
        type: 'error',
        message: 'Error al obtener detecciones específicas.'
      };
      isConnected.value = false;
    }
  } catch (error) {
    testResult.value = {
      type: 'error',
      message: `Error al probar detecciones: ${error.message}`
    };
    isConnected.value = false;
  } finally {
    loading.value = false;
  }
};

const refreshAll = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Limpiar caches
    deteccionesService.invalidateAllCache();
    
    // Refrescar componentes
    if (timelineRef.value && timelineRef.value.loadData) {
      await timelineRef.value.loadData();
    }
    
    if (heatmapRef.value && heatmapRef.value.loadTimestamps) {
      await heatmapRef.value.loadTimestamps();
    }
    
    isConnected.value = true;
  } catch (err) {
    error.value = 'Error al actualizar los datos';
    isConnected.value = false;
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  // Probar conexión inicial
  await testTimestamps();
});
</script>
