<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Cantidad de personas por edad</h2>
    <canvas ref="ageBarChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';
import personas from '@/data/registro_personas_biblioteca.json';

Chart.register(...registerables);

const ageBarChart = ref(null);
let chartInstance = null;

const getDataByAge = () => {
  const ageMap = {};
  personas.forEach((p) => {
    if (typeof p.edad === 'number' && p.id) {
      if (!ageMap[p.edad]) ageMap[p.edad] = new Set();
      ageMap[p.edad].add(p.id);
    }
  });
  return Object.entries(ageMap)
    .sort((a, b) => a[0] - b[0])
    .map(([edad, idSet]) => ({ edad, total: idSet.size }));
};

const renderChart = () => {
  const ctx = ageBarChart.value.getContext('2d');
  const dataByAge = getDataByAge();

  if (chartInstance) {
    chartInstance.destroy();
  }

  // Generar un color random para cada barra
  const randomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
  const barColors = dataByAge.map(() => randomColor());

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dataByAge.map((d) => d.edad),
      datasets: [
        {
          label: 'Cantidad de personas',
          data: dataByAge.map((d) => d.total),
          backgroundColor: barColors, // <-- Array de colores
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
      },
      scales: {
        x: {
          beginAtZero: true,
          title: { display: true, text: 'Cantidad de personas' },
        },
        y: {
          title: { display: true, text: 'Edad' },
        },
      },
    },
  });
};

onMounted(() => {
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