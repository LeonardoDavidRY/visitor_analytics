<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-800">{{ title }}</h3>
      <button
        @click="loadData" 
        :disabled="loading"
        class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
      >
        {{ loading ? 'Cargando...' : 'Actualizar' }}
      </button>
    </div>

    <!-- Estado de error -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- Sin datos -->
    <div v-else-if="!hasData" class="flex flex-col items-center justify-center h-64 text-gray-500">
      <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
      <p class="text-lg font-medium">No hay datos disponibles</p>
      <p class="text-sm mt-1">Intenta actualizar o verifica la conexión con la API</p>
    </div>

    <!-- Gráfico -->
    <div v-else>
      <slot :data="chartData" :hasData="hasData"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import apiService from '@/services/apiService.js';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  dataField: {
    type: String,
    required: true
  }
});

const loading = ref(false);
const error = ref(null);
const apiData = ref(null);

const chartData = computed(() => {
  if (!apiData.value || !apiData.value[props.dataField]) return {};
  return apiData.value[props.dataField];
});

const hasData = computed(() => {
  const data = chartData.value;
  if (!data || typeof data !== 'object') return false;
  
  if (Array.isArray(data)) {
    return data.length > 0;
  }
  
  const values = Object.values(data);
  return values.length > 0 && values.some(val => val > 0);
});

const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;
    apiData.value = await apiService.fetchData();
  } catch (err) {
    error.value = 'Error al cargar los datos';
    console.error('Error loading data:', err);
  } finally {
    loading.value = false;
  }
};

// Exponer métodos para uso externo
defineExpose({
  loadData,
  chartData,
  hasData
});
</script>
