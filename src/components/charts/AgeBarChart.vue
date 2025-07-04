<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Cantidad de personas por edad</h2>
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
      <canvas ref="ageBarChart" class="max-w-full max-h-96"></canvas>
      
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

const ageBarChart = ref(null);
let chartInstance = null;
let updateInterval = null;

const loading = ref(false);
const error = ref(null);
const apiData = ref(null);

const getDataByAge = () => {
  if (!apiData.value) return [];
  
  const ageData = apiData.value.conteo_edad || {};
  
  return Object.entries(ageData)
    .map(([ageRange, total]) => ({ 
      edad: ageRange, 
      total: total 
    }))
    .sort((a, b) => {
      // Ordenar por el primer número del rango
      const getFirstNumber = (range) => {
        const match = range.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      };
      return getFirstNumber(a.edad) - getFirstNumber(b.edad);
    });
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
  
  if (!ageBarChart.value) {
    if (retryCount < 10) { // Maximum 10 retries (1 second total)
      console.log(`AgeBarChart: Canvas not available, retry ${retryCount + 1}/10`);
      setTimeout(() => renderChart(retryCount + 1), 100);
      return;
    } else {
      console.error('AgeBarChart: Canvas never became available after 10 retries');
      return;
    }
  }
  
  console.log('AgeBarChart: Canvas found, creating chart');
  const ctx = ageBarChart.value.getContext('2d');
  const dataByAge = getDataByAge();

  if (chartInstance) {
    chartInstance.destroy();
  }

  // Renderizar siempre, incluso con datos vacíos
  const hasData = dataByAge.length > 0;
  
  // Colores predefinidos para consistencia
  const colors = [
    '#3B82F6', // blue-500
    '#EF4444', // red-500
    '#10B981', // green-500
    '#F59E0B', // yellow-500
    '#8B5CF6', // purple-500
    '#EC4899', // pink-500
  ];
  
  const barColors = dataByAge.map((_, index) => colors[index % colors.length]);

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: hasData ? dataByAge.map((d) => d.edad) : ['Sin datos'],
      datasets: [
        {
          label: 'Cantidad de personas',
          data: hasData ? dataByAge.map((d) => d.total) : [0],
          backgroundColor: barColors.length > 0 ? barColors : ['#E5E7EB'],
          borderColor: barColors.length > 0 ? barColors : ['#E5E7EB'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        title: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.x}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          title: { display: true, text: 'Cantidad de personas' },
        },
        y: {
          title: { display: true, text: 'Rango de edad' },
        },
      },
    },
  });
};

onMounted(async () => {
  console.log('AgeBarChart: Component mounted');
  
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
  max-height: 600px;
}
</style>