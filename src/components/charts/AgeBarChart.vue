<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Cantidad de personas por edad</h2>
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-500">Cargando datos...</div>
    </div>
    <div v-else-if="error" class="flex justify-center items-center h-64">
      <div class="text-red-500">Error al cargar datos: {{ error }}</div>
    </div>
    <canvas v-else ref="ageBarChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';
import hybridDataService from '@/services/hybridDataService.js';

Chart.register(...registerables);

const ageBarChart = ref(null);
let chartInstance = null;
const loading = ref(true);
const error = ref(null);
const ageData = ref([]);

const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;
    ageData.value = await hybridDataService.getAgeData();
    console.log('Datos de edad cargados:', ageData.value);
  } catch (err) {
    error.value = err.message || 'Error al cargar los datos';
    console.error('Error loading age data:', err);
  } finally {
    loading.value = false;
  }
};

const renderChart = () => {
  if (!ageBarChart.value || ageData.value.length === 0) {
    console.log('No se puede renderizar: canvas o datos no disponibles', {
      canvas: !!ageBarChart.value,
      dataLength: ageData.value.length,
      data: ageData.value
    });
    return;
  }
  
  const ctx = ageBarChart.value.getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  // Colores predefinidos para cada rango de edad
  const colorMap = {
    '18 -25': '#FF6384',
    '25 - 32': '#36A2EB', 
    '32 o mas': '#FFCE56'
  };
  
  const barColors = ageData.value.map(item => 
    colorMap[item.edad] || `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
  );

  console.log('Renderizando gráfico con datos:', ageData.value);

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ageData.value.map((d) => d.edad),
      datasets: [
        {
          label: 'Cantidad de personas',
          data: ageData.value.map((d) => d.total),
          backgroundColor: barColors,
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
              return `${context.dataset.label}: ${context.parsed.x} personas`;
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
          title: { display: true, text: 'Rango de Edad' },
        },
      },
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
canvas {
  max-width: 100%;
  max-height: 600px;
}
</style>