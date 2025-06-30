<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <GenderPieChart />
      </div>
    </div>
  </div>
</template>

<script>
import GenderPieChart from '@/components/charts/GenderPieChart.vue';

export default {
  name: 'GenderPieView',
  components: {
    GenderPieChart,
  },
};
</script>
