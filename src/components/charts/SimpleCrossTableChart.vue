<template>
  <ChartWrapper 
    title="Tabla Cruzada: Tipo de Usuario por Edad" 
    data-field="tabla_cruzada_tipo_edad"
    ref="chartWrapper"
  >
    <template #default="{ hasData }">
      <div v-if="hasData" class="overflow-x-auto">
        <div class="mb-4">
          <canvas ref="chartCanvas" width="400" height="300"></canvas>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-700 mb-3">Tabla de datos detallada:</h4>
          <CrossTable :data="chartWrapper?.chartData" />
        </div>
      </div>
    </template>
  </ChartWrapper>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import ChartWrapper from './ChartWrapper.vue';
import CrossTable from './CrossTable.vue';

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
  
  // Preparar datos para gráfico de barras agrupadas
  const ageGroups = Object.keys(data);
  const userTypes = new Set();
  
  // Obtener todos los tipos de usuario
  ageGroups.forEach(ageGroup => {
    Object.keys(data[ageGroup]).forEach(type => {
      userTypes.add(type);
    });
  });
  
  const userTypesArray = Array.from(userTypes);
  
  // Colores para cada tipo de usuario
  const colors = [
    '#3B82F6', // blue
    '#EF4444', // red  
    '#10B981', // green
    '#F59E0B', // yellow
    '#8B5CF6', // purple
    '#EC4899', // pink
  ];
  
  // Crear datasets para cada tipo de usuario
  const datasets = userTypesArray.map((userType, index) => ({
    label: userType,
    data: ageGroups.map(ageGroup => data[ageGroup][userType] || 0),
    backgroundColor: colors[index % colors.length],
    borderColor: colors[index % colors.length],
    borderWidth: 1,
  }));

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ageGroups,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y} personas`;
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
