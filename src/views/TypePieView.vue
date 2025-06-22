<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        Distribución por Tipo de Persona
      </h1>
      <TypePieChart />
    </div>
  </div>
</template>

<script>
import TypePieChart from '@/components/charts/TypePieChart.vue';

export default {
  name: 'TypePieView',
  components: {
    TypePieChart,
  },
};
</script>