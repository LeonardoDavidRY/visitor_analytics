<template>
  <ChartWrapper 
    title="Distribución por Edad" 
    data-field="conteo_edad"
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
  
  // Colores para cada barra
  const colors = [
    '#3B82F6', // blue
    '#EF4444', // red  
    '#10B981', // green
    '#F59E0B', // yellow
    '#8B5CF6', // purple
    '#EC4899', // pink
  ];

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cantidad de personas',
        data: values,
        backgroundColor: labels.map((_, index) => colors[index % colors.length]),
        borderColor: labels.map((_, index) => colors[index % colors.length]),
        borderWidth: 1,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.parsed.y} personas`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          },
          title: {
            display: true,
            text: 'Cantidad de personas'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Rango de edad'
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
