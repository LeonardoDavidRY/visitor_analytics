<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Visitantes por hora</h2>
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-500">Cargando datos...</div>
    </div>
    <div v-else-if="error" class="flex justify-center items-center h-64">
      <div class="text-red-500">Error al cargar datos: {{ error }}</div>
    </div>
    <canvas v-else ref="timelineChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import hybridDataService from '@/services/hybridDataService.js';

Chart.register(...registerables);

const timelineChart = ref(null);
let chartInstance = null;
const loading = ref(true);
const error = ref(null);
const hourlyData = ref([]);

const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;
    hourlyData.value = await hybridDataService.getHourlyData();
  } catch (err) {
    error.value = err.message || 'Error al cargar los datos';
    console.error('Error loading hourly data:', err);
  } finally {
    loading.value = false;
  }
};

const renderChart = () => {
  if (!timelineChart.value || hourlyData.value.length === 0) return;
  
  const ctx = timelineChart.value.getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hourlyData.value.map((d) => `${d.hour}:00`),
      datasets: [
        {
          label: 'Total de visitantes',
          data: hourlyData.value.map((d) => d.totalVisitors),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Hora del día',
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Cantidad de visitantes',
          },
        },
      },
    },
  });
};

onMounted(async () => {
  await loadData();
  renderChart();
});
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: 400px;
}
</style>