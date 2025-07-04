<template>
  <ChartWrapper 
    title="Visitantes por Hora" 
    data-field="conteo_hora"
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
  
  // Preparar datos - ordenar por hora
  const sortedEntries = Object.entries(data)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => a.hour - b.hour);
  
  const labels = sortedEntries.map(entry => `${entry.hour}:00`);
  const values = sortedEntries.map(entry => entry.count);

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Visitantes',
        data: values,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
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
              return `${context.parsed.y} visitantes`;
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
            text: 'Número de visitantes'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Hora del día'
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index',
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
