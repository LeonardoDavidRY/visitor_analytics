<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div 
              :class="[
                'w-3 h-3 rounded-full',
                lastUpdate && !loading ? 'bg-green-500' : 'bg-gray-400'
              ]"
            ></div>
            <span class="text-sm text-gray-600">
              {{ lastUpdate ? `Actualizado: ${lastUpdate}` : 'Sin datos' }}
            </span>
          </div>
          <button 
            @click="refreshAllData" 
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

      <!-- Panel de prueba API -->
      <ApiTestPanel />

      <!-- Estado de error global -->
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {{ error }}
      </div>

      <!-- Cards de resumen -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total por género -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Visitantes</p>
              <p class="text-2xl font-semibold text-gray-900">{{ totalVisitorsGender }}</p>
            </div>
          </div>
        </div>

        <!-- Total por tipo -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Tipos de Visitantes</p>
              <p class="text-2xl font-semibold text-gray-900">{{ totalVisitorsType }}</p>
            </div>
          </div>
        </div>

        <!-- Total por edad -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Rangos de Edad</p>
              <p class="text-2xl font-semibold text-gray-900">{{ totalVisitorsAge }}</p>
            </div>
          </div>
        </div>

        <!-- Total por hora -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Visitas por Hora</p>
              <p class="text-2xl font-semibold text-gray-900">{{ totalVisitorsHour }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Gráfico de tipos -->
        <SimpleTypeChart />

        <!-- Gráfico de edades -->
        <SimpleAgeChart />

        <!-- Gráfico por género -->
        <SimpleGenderChart />

        <!-- Gráfico de horas -->
        <SimpleHourChart />
      </div>

      <!-- Tabla cruzada 
      <div class="mt-8">
        <SimpleCrossTableChart />
      </div>-->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import apiService from '@/services/apiService.js';
import ApiTestPanel from '@/components/ApiTestPanel.vue';
import SimpleAgeChart from '@/components/charts/SimpleAgeChart.vue';
import SimpleTypeChart from '@/components/charts/SimpleTypeChart.vue';
import SimpleHourChart from '@/components/charts/SimpleHourChart.vue';
import SimpleGenderChart from '@/components/charts/SimpleGenderChart.vue';
import SimpleCrossTableChart from '@/components/charts/SimpleCrossTableChart.vue';
import PersonCountChart from '@/components/charts/PersonCountChart.vue';

const loading = ref(false);
const error = ref(null);
const apiData = ref(null);
const lastUpdate = ref(null);
let updateInterval = null;

// Computed properties para los totales
const totalVisitorsGender = computed(() => {
  if (!apiData.value?.conteo_sexo) return 0;
  return Object.values(apiData.value.conteo_sexo).reduce((sum, count) => sum + count, 0);
});

const totalVisitorsType = computed(() => {
  if (!apiData.value?.conteo_tipo) return 0;
  return Object.values(apiData.value.conteo_tipo).reduce((sum, count) => sum + count, 0);
});

const totalVisitorsAge = computed(() => {
  if (!apiData.value?.conteo_edad) return 0;
  return Object.values(apiData.value.conteo_edad).reduce((sum, count) => sum + count, 0);
});

const totalVisitorsHour = computed(() => {
  if (!apiData.value?.conteo_hora) return 0;
  return Object.values(apiData.value.conteo_hora).reduce((sum, count) => sum + count, 0);
});

const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;
    apiData.value = await apiService.fetchData();
    lastUpdate.value = new Date().toLocaleTimeString();
  } catch (err) {
    error.value = 'Error al cargar los datos del dashboard';
    console.error('Error loading dashboard data:', err);
  } finally {
    loading.value = false;
  }
};

const refreshAllData = async () => {
  // Invalidar cache para forzar nueva consulta
  apiService.invalidateCache();
  await loadData();
};

onMounted(async () => {
  await loadData();
  
  // Actualizar datos cada 30 segundos
  updateInterval = setInterval(loadData, 30000);
});

onBeforeUnmount(() => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
