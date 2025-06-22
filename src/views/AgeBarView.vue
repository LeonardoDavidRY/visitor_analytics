<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        Personas por Edad
      </h1>
      <AgeBarChart />
    </div>
  </div>
</template>

<script>
import AgeBarChart from '@/components/charts/AgeBarChart.vue';

export default {
  name: 'AgeBarView',
  components: {
    AgeBarChart,
  },
};
</script>