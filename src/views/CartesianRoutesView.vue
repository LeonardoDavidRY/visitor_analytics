<template>
  <div class="cartesian-routes-view">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        Rutas de Visitantes - Plano Cartesiano
      </h1>
      <p class="text-gray-600">
        Visualización de las rutas de los visitantes en un plano cartesiano bidimensional
      </p>
    </div>
    
    <CartesianRoutes />
  </div>
</template>

<script setup>
import CartesianRoutes from '@/components/charts/CartesianRoutes.vue'
</script>

<style scoped>
.cartesian-routes-view {
  width: 100%;
  height: 100%;
}
</style>