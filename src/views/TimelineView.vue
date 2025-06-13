<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        Línea de Tiempo de Visitantes
      </h1>

      <!-- Filtros -->
      <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <LocationFilter v-model="selectedZones" />
        <TimeSlider v-model="timeRange" />
      </div>

      <!-- Gráfico con filtros -->
      <TimelineChart :selectedZones="selectedZones" :timeRange="timeRange" />
    </div>
  </div>
</template>

<script>
import TimelineChart from '@/components/charts/TimelineChart.vue';
import LocationFilter from '@/components/filters/LocationFilter.vue';
import TimeSlider from '@/components/filters/TimeSlider.vue';

export default {
  name: 'TimelineView',
  components: {
    TimelineChart,
    LocationFilter,
    TimeSlider,
  },
  data() {
    return {
      selectedZones: [], // Inicialmente sin filtro
      timeRange: { start: 0, end: 23 }, // Rango completo por defecto
    };
  },
};
</script>
