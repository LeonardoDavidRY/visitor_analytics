<!-- src/components/TimelineChart.vue -->
<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Visitantes por hora</h2>
    <canvas ref="timelineChart"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import { visitorData } from '@/data/mockData';

Chart.register(...registerables);
// eslint-disable-next-line no-undef
const props = defineProps({
  selectedZones: {
    type: Array,
    default: () => [],
  },
  timeRange: {
    type: Object,
    required: true,
  },
});

const timelineChart = ref(null);
let chartInstance = null;

// Función para procesar datos con filtros aplicados
const getFilteredData = () => {
  const filtered = visitorData.filter((record) => {
    const inTimeRange =
      record.hour >= props.timeRange.start &&
      record.hour <= props.timeRange.end;
    const inZone =
      props.selectedZones.length === 0 ||
      props.selectedZones.includes(record.location.zone);
    return inTimeRange && inZone;
  });

  // Agregar por hora
  const hourMap = {};
  for (let hour = props.timeRange.start; hour <= props.timeRange.end; hour++) {
    hourMap[hour] = 0;
  }

  filtered.forEach((record) => {
    hourMap[record.hour] += record.visitors.total;
  });

  return Object.entries(hourMap).map(([hour, total]) => ({
    hour,
    totalVisitors: total,
  }));
};

const renderChart = () => {
  const ctx = timelineChart.value.getContext('2d');
  const dataByHour = getFilteredData();

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dataByHour.map((d) => `${d.hour}:00`),
      datasets: [
        {
          label: 'Total de visitantes',
          data: dataByHour.map((d) => d.totalVisitors),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
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

onMounted(() => {
  renderChart();
});

watch(() => [props.selectedZones, props.timeRange], renderChart, {
  deep: true,
});
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: 400px;
}
</style>
