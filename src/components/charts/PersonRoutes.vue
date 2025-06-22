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
    <div
      class="rounded-xl shadow-md overflow-hidden border border-gray-200 flex justify-center"
    >
      <div id="routesmap" class="h-[800px] w-[1200px]"></div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import data from '@/data/registro_personas_biblioteca.json';

// Fix para los iconos de Leaflet en Webpack/Vue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default {
  name: 'PersonRoutesMap',
  data() {
    return {
      map: null,
      polylines: [],
      markers: [],
      selectedId: '',
      personIds: [],
      routesByPerson: {},
    };
  },
  mounted() {
    // Agrupa los puntos por persona y los ordena por timestamp
    const routesByPerson = {};
    data.forEach((p) => {
      const id = String(p.id);
      if (!routesByPerson[id]) routesByPerson[id] = [];
      routesByPerson[id].push(p);
    });
    Object.values(routesByPerson).forEach(routeArr => {
      routeArr.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
    this.routesByPerson = routesByPerson;
    this.personIds = Object.keys(routesByPerson);

    // Inicializa el mapa
    this.map = L.map('routesmap', {
      maxZoom: 21,
      minZoom: 1,
    }).setView([-0.19834, -78.50402], 20);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 21,
    }).addTo(this.map);

    this.drawRoutes();

    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  },
  watch: {
    selectedId() {
      this.drawRoutes();
    },
  },
  methods: {
    drawRoutes() {
      // Limpia polylines y markers anteriores
      this.polylines.forEach(poly => this.map.removeLayer(poly));
      this.markers.forEach(marker => this.map.removeLayer(marker));
      this.polylines = [];
      this.markers = [];

      // Decide qué rutas mostrar
      const routes = this.selectedId
        ? { [this.selectedId]: this.routesByPerson[this.selectedId] }
        : this.routesByPerson;

      // Colores para las rutas
      const routeColors = [
        'blue', 'red', 'green', 'orange', 'purple', 'brown', 'magenta', 'teal', 'black'
      ];

      let idx = 0;
      for (const [id, route] of Object.entries(routes)) {
        if (!route || route.length === 0) continue;
        const latlngs = route.map(p => [p.latitude, p.longitude]);
        const polyline = L.polyline(latlngs, {
          color: routeColors[idx % routeColors.length],
          weight: 5,
          opacity: 0.7,
        }).addTo(this.map);
        this.polylines.push(polyline);

        // Markers con popup
        route.forEach((point, i) => {
          const marker = L.marker([point.latitude, point.longitude])
            .addTo(this.map)
            .bindPopup(
              `Persona ID: ${id}<br>
              Cámara ${point.id_camara}<br>
              ${point.latitude}, ${point.longitude}<br>
              ${point.timestamp}`
            );
          this.markers.push(marker);
        });
        idx++;
      }

      // Centra el mapa en la primera ruta mostrada
      const firstRoute = Object.values(routes)[0];
      if (firstRoute && firstRoute[0]) {
        this.map.setView([firstRoute[0].latitude, firstRoute[0].longitude], 20);
      }
    },
  },
};
</script>

<style scoped>
#routesmap {
  min-height: 600px;
  min-width: 900px;
  height: 800px;
  width: 1200px;
  z-index: 1;
}
</style>