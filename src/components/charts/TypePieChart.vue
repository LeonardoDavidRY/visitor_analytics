<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Distribución por tipo de persona</h2>
      <button 
        @click="loadData" 
        :disabled="loading"
        class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ loading ? 'Cargando...' : 'Actualizar' }}
      </button>
    </div>
    
    <div class="mb-4">
      <label class="mr-2 font-medium">Filtrar por género:</label>
      <select v-model="selectedGender" class="border rounded px-2 py-1">
        <option value="">Todos</option>
        <option value="Femenino">Femenino</option>
        <option value="Masculino">Masculino</option>
      </select>
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
    <div v-else class="chart-container">
      <canvas ref="pieChart"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';
import apiService from '@/services/apiService.js';

Chart.register(...registerables);

const pieChart = ref(null);
let chartInstance = null;

const selectedGender = ref('');
const loading = ref(false);
const error = ref(null);
const apiData = ref(null);

// Intervalo para actualizar datos automáticamente
let updateInterval = null;


const getDataByType = () => {
  if (!apiData.value) return {};
  
  const typeData = apiData.value.conte_tipo || {};
  const genderData = apiData.value.conte_sexo || {};
  
  // Si no hay filtro de género, devolver los datos de tipo directamente
  if (selectedGender.value === '') {
    return typeData;
  }
  
  // Si hay filtro de género, necesitaríamos una tabla cruzada tipo-género
  // Por ahora, devolvemos los datos de tipo (la API actual no tiene tabla cruzada tipo-género)
  return typeData;
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
  if (!pieChart.value) return;
  
  const ctx = pieChart.value.getContext('2d');
  const typeData = getDataByType();
  const labels = Object.keys(typeData);
  const data = Object.values(typeData);

  if (chartInstance) {
    chartInstance.destroy();
  }

  // No renderizar si no hay datos
  if (labels.length === 0) {
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
    '#14B8A6', // teal-500
    '#F97316', // orange-500
  ];
  
  const bgColors = labels.map((_, index) => colors[index % colors.length]);
  const borderColors = labels.map(() => '#374151'); // gray-700

  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          label: 'Cantidad',
          data,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed * 100) / total).toFixed(1);
              return `${context.label}: ${context.parsed} (${percentage}%)`;
            }
          }
        }
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

watch(selectedGender, renderChart);
</script>

<style scoped>
.chart-container {
  max-width: 700px; /* Aumenta el ancho máximo */
  margin: 0 auto;
}
canvas {
  width: 100% !important;
  height: 600px !important; /* Aumenta la altura */
  max-width: 100%;
  max-height: 600px;
}
</style>