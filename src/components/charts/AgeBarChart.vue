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
    
    <!-- Estado de carga -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-500">Cargando datos...</div>
    </div>
    
    <!-- Gráfico -->
    <canvas v-else ref="ageBarChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
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
  
  const ageData = apiData.value.conte_edad || {};
  
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
    renderChart();
  } catch (err) {
    error.value = 'Error al cargar los datos';
    console.error('Error loading data:', err);
  } finally {
    loading.value = false;
  }
};

const renderChart = () => {
  if (!ageBarChart.value) return;
  
  const ctx = ageBarChart.value.getContext('2d');
  const dataByAge = getDataByAge();

  if (chartInstance) {
    chartInstance.destroy();
  }

  // No renderizar si no hay datos
  if (dataByAge.length === 0) {
    return;
  }

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
      labels: dataByAge.map((d) => d.edad),
      datasets: [
        {
          label: 'Cantidad de personas',
          data: dataByAge.map((d) => d.total),
          backgroundColor: barColors,
          borderColor: barColors.map(color => color),
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
  max-height: 600px;
}
</style>