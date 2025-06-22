<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        Mapa de Calor de Visitantes
      </h1>
      <HeatmapChart />
    </div>
  </div>
</template>

<script>
import HeatmapChart from '@/components/charts/HeatmapChart.vue'

export default {
  name: 'HeatmapView',
  components: {
    HeatmapChart,
  },
}
</script>
