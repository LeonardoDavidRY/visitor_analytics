<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Rutas de Personas</h2>
    <div class="mb-4">
      <label class="font-medium mr-2">Filtrar por persona:</label>
      <select v-model="selectedId" class="border rounded px-2 py-1">
        <option value="">Todas</option>
        <option v-for="id in personIds" :key="id" :value="id">{{ id }}</option>
      </select>
    </div>
    <l-map
      style="height: 500px; width: 100%; max-width: 900px; margin: 0 auto;"
      :zoom="mapZoom"
      :center="mapCenter"
      :options="{ zoomControl: true }"
    >
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <template v-for="(route, id, idx) in filteredRoutes" :key="'line-' + id">
        <l-polyline
          :lat-lngs="route.map(p => [p.latitude, p.longitude])"
          :color="routeColors[idx % routeColors.length]"
        />
        <l-marker
          v-for="(point, i) in route"
          :key="'marker-' + id + '-' + i"
          :lat-lng="[point.latitude, point.longitude]"
        >
          <l-popup>
            Persona ID: {{ id }}<br />
            Cámara {{ point.id_camara }}<br />
            {{ point.latitude }}, {{ point.longitude }}<br />
            {{ point.timestamp }}
          </l-popup>
        </l-marker>
      </template>
    </l-map>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { LMap, LTileLayer, LMarker, LPopup, LPolyline } from 'vue3-leaflet';
import 'leaflet/dist/leaflet.css';
import personas from '@/data/registro_personas_biblioteca.json';

// Agrupa los puntos por persona y los ordena por timestamp
const routesByPerson = {};
personas.forEach((p) => {
  const id = String(p.id); // Asegura que el id sea string para el filtro
  if (!routesByPerson[id]) routesByPerson[id] = [];
  routesByPerson[id].push(p);
});
Object.values(routesByPerson).forEach(routeArr => {
  routeArr.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
});

// IDs únicos de personas (como string)
const personIds = Object.keys(routesByPerson);

// Filtro
const selectedId = ref('');

// Rutas filtradas
const filteredRoutes = computed(() => {
  if (!selectedId.value) return routesByPerson;
  return { [selectedId.value]: routesByPerson[selectedId.value] };
});

// Centro y zoom del mapa
const mapCenter = computed(() => {
  // Busca el primer punto de la(s) ruta(s) filtrada(s)
  const firstRoute = Object.values(filteredRoutes.value)[0];
  if (firstRoute && firstRoute[0]) {
    return [firstRoute[0].latitude, firstRoute[0].longitude];
  }
  return [-0.19834, -78.50402]; // Quito
});
const mapZoom = 17;

// Colores para las rutas
const routeColors = [
  'blue', 'red', 'green', 'orange', 'purple', 'brown', 'magenta', 'teal', 'black'
];
</script>