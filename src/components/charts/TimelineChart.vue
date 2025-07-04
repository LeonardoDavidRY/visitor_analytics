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
    
    <!-- Estado de carga -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-500">Cargando datos...</div>
    </div>
    
    <!-- Gráfico -->
    <canvas v-else ref="timelineChart"></canvas>
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
    
    // Usar nextTick para asegurar que el DOM esté actualizado
    nextTick(() => {
      renderChart();
    });
  } catch (err) {
    error.value = 'Error al cargar los datos';
    console.error('Error loading data:', err);
  } finally {
    loading.value = false;
  }
};

const renderChart = () => {
  if (!timelineChart.value) {
    console.warn('Canvas no disponible para TimelineChart');
    return;
  }
  
  const ctx = timelineChart.value.getContext('2d');
  const dataByHour = getDataByHour();

  if (chartInstance) {
    chartInstance.destroy();
  }

  // No renderizar si no hay datos
  if (dataByHour.length === 0) {
    console.warn('No hay datos disponibles para TimelineChart');
    return;
  }

  // No renderizar si no hay datos
  if (dataByHour.length === 0) {
    return;
  }

  const color = {
    border: 'rgba(59, 130, 246, 1)',
    background: 'rgba(59, 130, 246, 0.15)',
  };

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dataByHour.map((d) => `${d.hour}:00`),
      datasets: [
        {
          label: 'Total de visitantes',
          data: dataByHour.map((d) => d.totalVisitors),
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
  await loadData();
  
  // Actualizar datos cada 30 segundos
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