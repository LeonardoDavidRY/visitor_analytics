<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        Línea de Tiempo de Visitantes
      </h1>

      <!-- Solo el gráfico, el filtro de cámara está dentro del componente -->
      <TimelineChart />
    </div>
  </div>
</template>

<script>
import TimelineChart from '@/components/charts/TimelineChart.vue';

export default {
  name: 'TimelineView',
  components: {
    TimelineChart,
  },
};
</script>