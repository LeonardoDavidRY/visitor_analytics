<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Distribución por género</h2>
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-500">Cargando datos...</div>
    </div>
    <div v-else-if="error" class="flex justify-center items-center h-64">
      <div class="text-red-500">Error al cargar datos: {{ error }}</div>
    </div>
    <div v-else class="chart-container">
      <canvas ref="genderChart"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';
import hybridDataService from '@/services/hybridDataService.js';

Chart.register(...registerables);

const genderChart = ref(null);
let chartInstance = null;
const loading = ref(true);
const error = ref(null);
const genderData = ref([]);

const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;
    genderData.value = await hybridDataService.getGenderData();
    console.log('Datos de género cargados:', genderData.value);
  } catch (err) {
    error.value = err.message || 'Error al cargar los datos';
    console.error('Error loading gender data:', err);
  } finally {
    loading.value = false;
  }
};

const renderChart = () => {
  if (!genderChart.value || genderData.value.length === 0) {
    console.log('No se puede renderizar el gráfico de género: canvas o datos no disponibles');
    return;
  }
  
  const ctx = genderChart.value.getContext('2d');
  const labels = genderData.value.map(item => item.genero);
  const data = genderData.value.map(item => item.count);

  if (chartInstance) {
    chartInstance.destroy();
  }

  // Colores específicos para género
  const colorMap = {
    'femenino': '#FF6B9D',    // Rosa
    'masculino': '#4ECDC4',   // Azul verdoso
    'otro': '#FFE66D',        // Amarillo
    'no especificado': '#A8E6CF' // Verde claro
  };
  
  const bgColors = genderData.value.map(item => 
    colorMap[item.genero.toLowerCase()] || `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
  );

  console.log('Renderizando gráfico de género con datos:', {
    labels,
    data,
    colors: bgColors
  });

  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          label: 'Cantidad',
          data,
          backgroundColor: bgColors,
          borderColor: '#fff',
          borderWidth: 3,
          hoverBorderWidth: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 20,
            font: {
              size: 14
            }
          }
        },
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed} personas (${percentage}%)`;
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1000
      }
    },
  });
};

onMounted(async () => {
  await loadData();
  renderChart();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<style scoped>
.chart-container {
  max-width: 600px;
  margin: 0 auto;
}
canvas {
  width: 100% !important;
  height: 500px !important;
  max-width: 100%;
  max-height: 500px;
}
</style>
