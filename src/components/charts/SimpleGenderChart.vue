<template>
  <ChartWrapper 
    title="Distribución por Género" 
    data-field="conteo_sexo"
    ref="chartWrapper"
  >
    <template #default="{ hasData }">
      <div v-if="hasData" class="relative">
        <canvas ref="chartCanvas" width="400" height="300"></canvas>
      </div>
    </template>
  </ChartWrapper>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import ChartWrapper from './ChartWrapper.vue';

Chart.register(...registerables);

const chartCanvas = ref(null);
const chartWrapper = ref(null);
let chartInstance = null;

const createChart = (data) => {
  if (!chartCanvas.value || !data || Object.keys(data).length === 0) {
    return;
  }

  // Limpiar gráfico anterior
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext('2d');
  
  // Preparar datos
  const labels = Object.keys(data);
  const values = Object.values(data);
  
  // Colores específicos para género
  const genderColors = {
    'Femenino': '#EC4899', // pink
    'Masculino': '#3B82F6', // blue
    'Otro': '#10B981', // green
  };
  
  const colors = labels.map(label => genderColors[label] || '#6B7280');

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '50%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed} personas (${percentage}%)`;
            }
          }
        }
      }
    }
  });
};

// Observar cambios en los datos del wrapper
watch(() => chartWrapper.value?.chartData, (newData) => {
  if (newData && chartWrapper.value?.hasData) {
    nextTick(() => {
      createChart(newData);
    });
  }
}, { deep: true });

onMounted(() => {
  // Cargar datos iniciales
  if (chartWrapper.value) {
    chartWrapper.value.loadData();
  }
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>
