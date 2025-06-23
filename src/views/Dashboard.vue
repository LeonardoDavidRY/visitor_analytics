<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        Dashboard de Visitantes
      </h1>

      <!-- Gráfico de visitantes -->
      <div class="mb-8">
        <PersonCountChart />
      </div>
    </div>
  </div>
</template>

<script>
import PersonCountChart from '@/components/charts/PersonCountChart.vue';

export default {
  name: 'DashboardView',
  components: {
    PersonCountChart,
  },
};
</script>
