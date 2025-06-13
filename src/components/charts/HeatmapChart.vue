<!-- src/components/HeatmapChart.vue -->
<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Mapa de calor de visitantes</h2>
    <div id="heatmap" style="height: 500px"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import L from 'leaflet';
import 'leaflet.heat';
import { getHeatmapData } from '@/data/mockData';

onMounted(() => {
  const heatmapData = getHeatmapData().map((d) => [
    d.location[0], // lat
    d.location[1], // lng
    d.intensity / 100, // intensidad normalizada
  ]);

  const map = L.map('heatmap').setView([-0.1812, -78.4683], 17);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  L.heatLayer(heatmapData, {
    radius: 25,
    blur: 15,
    maxZoom: 18,
  }).addTo(map);
});
</script>

<style scoped>
#heatmap {
  width: 100%;
}
</style>
