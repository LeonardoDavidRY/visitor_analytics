<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-800">Timeline de Detecciones</h3>
      <div class="flex space-x-2">
        <button
          @click="loadData" 
          :disabled="loading"
          class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
        >
          {{ loading ? 'Cargando...' : 'Actualizar' }}
        </button>
        <select 
          v-model="intervalo" 
          @change="loadData"
          class="px-3 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="1">1 min</option>
          <option value="5">5 min</option>
          <option value="10">10 min</option>
          <option value="15">15 min</option>
          <option value="30">30 min</option>
          <option value="60">1 hora</option>
        </select>
      </div>
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="text-lg font-medium">No hay detecciones disponibles</p>
      <p class="text-sm mt-1">Intenta con un intervalo diferente</p>
    </div>

    <!-- Estadísticas -->
    <div v-else class="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-blue-50 p-3 rounded">
        <div class="text-2xl font-bold text-blue-600">{{ totalDetecciones }}</div>
        <div class="text-sm text-gray-600">Total Detecciones</div>
      </div>
      <div class="bg-green-50 p-3 rounded">
        <div class="text-2xl font-bold text-green-600">{{ horaActividad.hora }}</div>
        <div class="text-sm text-gray-600">Hora Pico</div>
      </div>
      <div class="bg-purple-50 p-3 rounded">
        <div class="text-2xl font-bold text-purple-600">{{ horaActividad.detecciones }}</div>
        <div class="text-sm text-gray-600">Detecciones Máx</div>
      </div>
      <div class="bg-orange-50 p-3 rounded">
        <div class="text-2xl font-bold text-orange-600">{{ promedioDetecciones }}</div>
        <div class="text-sm text-gray-600">Promedio</div>
      </div>
    </div>

    <!-- Gráfico -->
    <div v-if="hasData" class="relative">
      <canvas ref="chartCanvas" width="400" height="300"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import { Chart, registerables } from 'chart.js';
import deteccionesService from '@/services/deteccionesService.js';

Chart.register(...registerables);

const chartCanvas = ref(null);
const loading = ref(false);
const error = ref(null);
const timelineData = ref({});
const intervalo = ref(5); // minutos
let chartInstance = null;

// Computed properties
const hasData = computed(() => {
  return Object.keys(timelineData.value).length > 0;
});

const totalDetecciones = computed(() => {
  return Object.values(timelineData.value).reduce((sum, count) => sum + count, 0);
});

const horaActividad = computed(() => {
  if (!hasData.value) return { hora: '--', detecciones: 0 };
  
  const max = Math.max(...Object.values(timelineData.value));
  const horaMax = Object.keys(timelineData.value).find(key => timelineData.value[key] === max);
  
  return {
    hora: horaMax ? new Date(horaMax).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : '--',
    detecciones: max
  };
});

const promedioDetecciones = computed(() => {
  if (!hasData.value) return 0;
  const valores = Object.values(timelineData.value);
  return Math.round(valores.reduce((sum, count) => sum + count, 0) / valores.length);
});

// Métodos
const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const data = await deteccionesService.getDeteccionesAgrupadas(intervalo.value);
    timelineData.value = data;
    
    nextTick(() => {
      createChart();
    });
  } catch (err) {
    error.value = 'Error al cargar el timeline de detecciones';
    console.error('Error loading timeline data:', err);
  } finally {
    loading.value = false;
  }
};

const createChart = () => {
  if (!chartCanvas.value || !hasData.value) {
    return;
  }

  // Limpiar gráfico anterior
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext('2d');
  
  // Preparar datos ordenados por tiempo
  const sortedEntries = Object.entries(timelineData.value)
    .sort(([a], [b]) => new Date(a) - new Date(b));
  
  const labels = sortedEntries.map(([timestamp]) => {
    const fecha = new Date(timestamp);
    return fecha.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  });
  
  const data = sortedEntries.map(([, count]) => count);

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Detecciones',
        data: data,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.parsed.y} detecciones`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          },
          title: {
            display: true,
            text: 'Número de detecciones'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Hora'
          },
          maxTicksLimit: 12
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
};

onMounted(() => {
  loadData();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>
