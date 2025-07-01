<template>
  <div class="cartesian-heatmap-view">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        Mapa de Calor - Plano Cartesiano
      </h1>
      <p class="text-gray-600">
        Visualización del mapa de calor de visitantes en un plano cartesiano bidimensional
      </p>
    </div>
    
    <CartesianHeatmap />
  </div>
</template>

<script setup>
import CartesianHeatmap from '@/components/charts/CartesianHeatmap.vue'
</script>

<style scoped>
.cartesian-heatmap-view {
  width: 100%;
  height: 100%;
}
</style>