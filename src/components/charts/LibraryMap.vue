<template>
  <div class="w-full h-full">
    <div id="library-map" class="w-full h-full"></div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet.heat'; // Importa el plugin
import data from '@/data/registro_personas_biblioteca.json';

export default {
  name: 'LibraryMap',
  mounted() {
    const centerLatLng = [-0.19834, -78.50402];

    const map = L.map('library-map', {
      center: centerLatLng,
      zoom: 20,
      minZoom: 20,
      maxZoom: 20,
      scrollWheelZoom: false,
      zoomControl: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Prepara los datos para el heatmap
    const heatData = data.map(item => [item.latitude, item.longitude, 1]);

    // Agrega la capa de heatmap
    L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 20,
      gradient: { 0.4: '#4f46e5', 0.65: '#0ea5e9', 1: '#facc15' }
    }).addTo(map);

    setTimeout(() => map.invalidateSize(), 300);
  },
};
</script>

<style scoped>
#library-map {
  height: 600px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  outline: none;
}
</style>