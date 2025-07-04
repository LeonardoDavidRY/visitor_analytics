<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Visitantes por hora</h2>
      <button 
        @click="loadData" 
        :disabled="loading"
        class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ loading ? 'Cargando...' : 'Actualizar' }}
      </button>
    </div>
    
    <!-- Estado de error -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>
    
    <!-- Gráfico siempre presente -->
    <div class="relative">
      <canvas ref="timelineChart"></canvas>
      
      <!-- Overlay de carga -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
        <div class="text-gray-500">Cargando datos...</div>
      </div>
      
      <!-- Overlay de datos de muestra -->
      <div v-if="!loading && !apiData" class="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
        <span class="text-gray-500">Usando datos de muestra</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import apiService from '@/services/apiService.js';

Chart.register(...registerables);

const timelineChart = ref(null);
let chartInstance = null;
let updateInterval = null;

const loading = ref(false);
const error = ref(null);
const apiData = ref(null);

// Procesar datos agrupados por hora
const getDataByHour = () => {
  if (!apiData.value) return [];
  
  const hourData = apiData.value.conteo_hora || {};
  
  return Object.entries(hourData)
    .map(([hour, totalVisitors]) => ({
      hour: parseInt(hour),
      totalVisitors: totalVisitors,
    }))
    .sort((a, b) => a.hour - b.hour);
};

const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;
    apiData.value = await apiService.fetchData();
    
    // Wait for next tick to ensure DOM is ready
    await nextTick();
    renderChart();
  } catch (err) {
    error.value = 'Error al cargar los datos';
    console.error('Error loading data:', err);
  } finally {
    loading.value = false;
  }
};

const renderChart = async (retryCount = 0) => {
  // Wait for DOM to be ready
  await nextTick();
  
  if (!timelineChart.value) {
    if (retryCount < 10) { // Maximum 10 retries (1 second total)
      console.log(`TimelineChart: Canvas not available, retry ${retryCount + 1}/10`);
      setTimeout(() => renderChart(retryCount + 1), 100);
      return;
    } else {
      console.error('TimelineChart: Canvas never became available after 10 retries');
      return;
    }
  }
  
  console.log('TimelineChart: Canvas found, creating chart');
  const ctx = timelineChart.value.getContext('2d');
  const dataByHour = getDataByHour();

  if (chartInstance) {
    chartInstance.destroy();
  }

  // Renderizar siempre, incluso con datos vacíos
  const hasData = dataByHour.length > 0;
  
  const color = {
    border: 'rgba(59, 130, 246, 1)',
    background: 'rgba(59, 130, 246, 0.15)',
  };

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hasData ? dataByHour.map((d) => `${d.hour}:00`) : ['Sin datos'],
      datasets: [
        {
          label: 'Total de visitantes',
          data: hasData ? dataByHour.map((d) => d.totalVisitors) : [0],
          borderColor: color.border,
          backgroundColor: color.background,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: color.border,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: color.border,
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return `Visitantes: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Hora del día',
            color: '#6B7280',
          },
          grid: {
            color: 'rgba(107, 114, 128, 0.1)',
          },
          ticks: {
            color: '#6B7280',
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Cantidad de visitantes',
            color: '#6B7280',
          },
          grid: {
            color: 'rgba(107, 114, 128, 0.1)',
          },
          ticks: {
            color: '#6B7280',
            callback: function(value) {
              return Math.floor(value);
            }
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    },
  });
};

onMounted(async () => {
  console.log('TimelineChart: Component mounted');
  
  // Initial chart render with empty data
  await nextTick();
  renderChart();
  
  // Load data
  await loadData();
  
  // Update every 30 seconds
  updateInterval = setInterval(loadData, 30000);
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: 400px;
}
</style>