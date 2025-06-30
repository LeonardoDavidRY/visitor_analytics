<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Distribución por tipo de persona</h2>
    <div class="mb-4">
      <label class="mr-2 font-medium">Filtrar por género:</label>
      <select v-model="selectedGender" class="border rounded px-2 py-1" @change="loadData">
        <option value="">Todos</option>
        <option value="masculino">Masculino</option>
        <option value="femenino">Femenino</option>
      </select>
    </div>
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-500">Cargando datos...</div>
    </div>
    <div v-else-if="error" class="flex justify-center items-center h-64">
      <div class="text-red-500">Error al cargar datos: {{ error }}</div>
    </div>
    <div v-else class="chart-container">
      <canvas ref="pieChart"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import hybridDataService from '@/services/hybridDataService.js';

Chart.register(...registerables);

const pieChart = ref(null);
let chartInstance = null;
const selectedGender = ref('');
const loading = ref(true);
const error = ref(null);
const typeData = ref([]);

const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;
    typeData.value = await hybridDataService.getTypeData(selectedGender.value);
  } catch (err) {
    error.value = err.message || 'Error al cargar los datos';
    console.error('Error loading type data:', err);
  } finally {
    loading.value = false;
  }
};

const renderChart = () => {
  if (!pieChart.value || typeData.value.length === 0) return;
  
  const ctx = pieChart.value.getContext('2d');
  const labels = typeData.value.map(item => {
    // Capitalizar la primera letra
    return item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1);
  });
  const data = typeData.value.map(item => item.count);

  if (chartInstance) {
    chartInstance.destroy();
  }

  // Genera un color aleatorio para cada tipo
  const randomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
  const bgColors = labels.map(() => randomColor());
  const borderColors = labels.map(() => '#000');

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
      },
    },
  });
};

onMounted(async () => {
  await loadData();
  renderChart();
});

watch([typeData], () => {
  renderChart();
});
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