<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Visitantes por hora</h2>
    <div class="mb-4">
      <label class="mr-2 font-medium">Filtrar por cámara:</label>
      <select v-model="selectedCamera" class="border rounded px-2 py-1">
        <option value="">Todas</option>
        <option v-for="cam in cameras" :key="cam" :value="cam">
          Cámara {{ cam }}
        </option>
      </select>
    </div>
    <canvas ref="timelineChart"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import personas from '@/data/registro_personas_biblioteca.json'; // Cambia el import

Chart.register(...registerables);

const timelineChart = ref(null);
let chartInstance = null;

// Obtener lista única de cámaras del JSON
const cameras = Array.from(
  new Set(personas.filter((p) => p.id_camara).map((p) => p.id_camara))
).sort((a, b) => a - b);

const selectedCamera = ref('');

// Procesar datos agrupados por hora y cámara, contando personas únicas
const getDataByHour = () => {
  // Inicializar el mapa de horas de 6 a 12 con Sets para ids únicos
  const hourMap = {};
  for (let hour = 6; hour <= 12; hour++) {
    hourMap[hour] = new Set();
  }

  // Filtrar por cámara si corresponde
  const filtered = personas.filter((p) => {
    if (!p.timestamp || !p.id_camara) return false;
    if (selectedCamera.value && p.id_camara !== Number(selectedCamera.value))
      return false;
    return true;
  });

  // Agrupar por hora, agregando solo ids únicos
  filtered.forEach((p) => {
    const hour = new Date(p.timestamp).getUTCHours();
    if (hour >= 6 && hour <= 22) {
      hourMap[hour].add(p.id);
    }
  });

  // Convertir a array para el gráfico
  return Object.entries(hourMap).map(([hour, idSet]) => ({
    hour,
    totalVisitors: idSet.size, // Cantidad de ids únicos
  }));
};

// Define un color para cada cámara y uno para "todas"
const cameraColors = {
  '': {
    border: 'rgba(59, 130, 246, 1)',
    background: 'rgba(59, 130, 246, 0.15)',
  },
  1: {
    border: 'rgba(239, 68, 68, 1)',
    background: 'rgba(239, 68, 68, 0.15)',
  },
  2: {
    border: 'rgba(16, 185, 129, 1)',
    background: 'rgba(16, 185, 129, 0.15)',
  },
  3: {
    border: 'rgba(245, 158, 11, 1)',
    background: 'rgba(245, 158, 11, 0.15)',
  },
};

const renderChart = () => {
  const ctx = timelineChart.value.getContext('2d');
  const dataByHour = getDataByHour();

  if (chartInstance) {
    chartInstance.destroy();
  }

  const color = cameraColors[selectedCamera.value] || cameraColors[''];

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dataByHour.map((d) => `${d.hour}:00`),
      datasets: [
        {
          label: 'Total de visitantes únicos',
          data: dataByHour.map((d) => d.totalVisitors),
          borderColor: color.border,
          backgroundColor: color.background,
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
            text: 'Cantidad de visitantes únicos',
          },
        },
      },
    },
  });
};

onMounted(() => {
  renderChart();
});

watch(selectedCamera, renderChart);
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: 400px;
}
</style>