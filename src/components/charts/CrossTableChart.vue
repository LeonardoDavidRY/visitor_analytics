<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Distribución por Tipo y Edad</h2>
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
      <canvas ref="crossTableChart"></canvas>
      
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

const crossTableChart = ref(null);
let chartInstance = null;
let updateInterval = null;

const loading = ref(false);
const error = ref(null);
const apiData = ref(null);

const getCrossTableData = () => {
  if (!apiData.value) return { labels: [], datasets: [] };
  
  const crossTable = apiData.value.tabla_cruzada_tipo_edad || {};
  const ageRanges = Object.keys(crossTable);
  
  if (ageRanges.length === 0) return { labels: [], datasets: [] };
  
  // Obtener todos los tipos únicos
  const allTypes = new Set();
  Object.values(crossTable).forEach(ageData => {
    Object.keys(ageData).forEach(type => allTypes.add(type));
  });
  
  const types = Array.from(allTypes);
  
  // Colores predefinidos para cada tipo
  const colors = [
    '#3B82F6', // blue-500
    '#EF4444', // red-500
    '#10B981', // green-500
    '#F59E0B', // yellow-500
    '#8B5CF6', // purple-500
    '#EC4899', // pink-500
    '#14B8A6', // teal-500
    '#F97316', // orange-500
  ];
  
  // Crear datasets para cada tipo
  const datasets = types.map((type, index) => ({
    label: type,
    data: ageRanges.map(ageRange => crossTable[ageRange][type] || 0),
    backgroundColor: colors[index % colors.length],
    borderColor: colors[index % colors.length],
    borderWidth: 1,
  }));
  
  return {
    labels: ageRanges,
    datasets: datasets
  };
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
  
  if (!crossTableChart.value) {
    if (retryCount < 10) { // Maximum 10 retries (1 second total)
      console.log(`CrossTableChart: Canvas not available, retry ${retryCount + 1}/10`);
      setTimeout(() => renderChart(retryCount + 1), 100);
      return;
    } else {
      console.error('CrossTableChart: Canvas never became available after 10 retries');
      return;
    }
  }
  
  console.log('CrossTableChart: Canvas found, creating chart');
  
  const ctx = crossTableChart.value.getContext('2d');
  const chartData = getCrossTableData();

  if (chartInstance) {
    chartInstance.destroy();
  }

  // No renderizar si no hay datos
  if (chartData.labels.length === 0) {
    return;
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Rango de edad',
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
            text: 'Cantidad de personas',
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
  console.log('CrossTableChart: Component mounted');
  
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
