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
    
    <!-- Gráfico siempre presente -->
    <div class="chart-container">
      <canvas ref="pieChart"></canvas>
      
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
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
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
  
  const typeData = apiData.value.conteo_tipo || {};
  const genderData = apiData.value.conteo_sexo || {};
  
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
  
  if (!pieChart.value) {
    if (retryCount < 10) { // Maximum 10 retries (1 second total)
      console.log(`TypePieChart: Canvas not available, retry ${retryCount + 1}/10`);
      setTimeout(() => renderChart(retryCount + 1), 100);
      return;
    } else {
      console.error('TypePieChart: Canvas never became available after 10 retries');
      return;
    }
  }
  
  console.log('TypePieChart: Canvas found, creating chart');
  const ctx = pieChart.value.getContext('2d');
  const typeData = getDataByType();
  const labels = Object.keys(typeData);
  const data = Object.values(typeData);

  if (chartInstance) {
    chartInstance.destroy();
  }

  // Renderizar siempre, incluso con datos vacíos
  const hasData = labels.length > 0 && data.some(value => value > 0);
  
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
  
  const bgColors = hasData ? labels.map((_, index) => colors[index % colors.length]) : ['#E5E7EB'];
  const borderColors = hasData ? labels.map(() => '#374151') : ['#9CA3AF'];

  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: hasData ? labels : ['Sin datos'],
      datasets: [
        {
          label: 'Cantidad',
          data: hasData ? data : [1],
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
  console.log('TypePieChart: Component mounted');
  
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

watch(selectedGender, renderChart);
</script>

<style scoped>
.chart-container {
  max-width: 700px; /* Aumenta el ancho máximo */
  margin: 0 auto;
  position: relative; /* Para posicionar los overlays */
}

canvas {
  width: 100% !important;
  height: 600px !important; /* Aumenta la altura */
  max-width: 100%;
  max-height: 600px;
}
</style>