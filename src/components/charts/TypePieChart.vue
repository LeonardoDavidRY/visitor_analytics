<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Distribución por tipo de persona</h2>
    <div class="mb-4">
      <label class="mr-2 font-medium">Filtrar por género:</label>
      <select v-model="selectedGender" class="border rounded px-2 py-1">
        <option value="">Todos</option>
        <option value="masculino">Masculino</option>
        <option value="femenino">Femenino</option>
      </select>
    </div>
    <div class="chart-container">
      <canvas ref="pieChart"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import personas from '@/data/registro_personas_biblioteca.json';

Chart.register(...registerables);

const pieChart = ref(null);
let chartInstance = null;

const selectedGender = ref('');


const getDataByType = () => {
  const typeMap = {};
  personas.forEach((p) => {
    if (
      typeof p.tipo === 'string' &&
      (selectedGender.value === '' || p.genero === selectedGender.value)
    ) {
      typeMap[p.tipo] = (typeMap[p.tipo] || 0) + 1;
    }
  });
  return typeMap;
};

const renderChart = () => {
  const ctx = pieChart.value.getContext('2d');
  const typeData = getDataByType();
  const labels = Object.keys(typeData);
  const data = Object.values(typeData);

  if (chartInstance) {
    chartInstance.destroy();
  }

  // Genera un color aleatorio para cada tipo
  const randomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
  const bgColors = labels.map(() => randomColor());
  const borderColors = labels.map(() => '#000'); // <-- Bordes negros

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

onMounted(() => {
  renderChart();
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