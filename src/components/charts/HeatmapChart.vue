<template>
  <div
    class="rounded-xl shadow-md overflow-hidden border border-gray-200 flex justify-center items-center"
  >
    <div id="heatmap" class="h-[800px] w-[1200px]"></div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet.heat';
import data from '@/data/registro_personas_biblioteca.json';

export default {
  name: 'HeatmapChart',
  mounted() {
    // Permitir más zoom (hasta 21)
    const map = L.map('heatmap', {
      maxZoom: 21,
      minZoom: 1,
    }).setView([-0.19834, -78.50402], 20);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 21,
    }).addTo(map);

    const heatPoints = data.map((item) => [item.latitude, item.longitude, 1]);

    L.heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 21,
    }).addTo(map);

    // Soluciona el render roto si el componente fue montado oculto
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  },
};
</script>

<style scoped>
/* fallback por si no aplica Tailwind */
#heatmap {
  min-height: 600px;
  min-width: 900px;
  height: 800px;
  width: 1200px;
}
</style>