<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-800">Mapa de Calor - Coordenadas</h3>
      <div class="flex space-x-2">
        <button
          @click="loadTimestamps" 
          :disabled="loading"
          class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
        >
          {{ loading ? 'Cargando...' : 'Actualizar' }}
        </button>
        <button
          @click="toggleAutoRefresh"
          :class="[
            'px-3 py-1 rounded text-sm',
            autoRefresh ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          {{ autoRefresh ? '⏸ Auto' : '▶ Auto' }}
        </button>
      </div>
    </div>

    <!-- Selector de timestamp -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Seleccionar momento temporal:
      </label>
      <div class="flex gap-2">
        <select 
          v-model="selectedTimestamp"
          @change="loadDetecciones"
          class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          :disabled="loading"
        >
          <option value="">Selecciona un timestamp...</option>
          <option 
            v-for="timestamp in uniqueTimestamps" 
            :key="timestamp"
            :value="timestamp"
          >
            {{ formatTimestamp(timestamp) }}
          </option>
        </select>
        <button
          @click="useLatestTimestamp"
          :disabled="loading || uniqueTimestamps.length === 0"
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 text-sm"
        >
          Más Reciente
        </button>
      </div>
    </div>

    <!-- Estado de error -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- Info de detecciones -->
    <div v-else-if="deteccionesData && deteccionesData.success" class="mb-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div class="bg-blue-50 p-3 rounded">
          <div class="text-2xl font-bold text-blue-600">{{ deteccionesData.total_encontradas }}</div>
          <div class="text-sm text-gray-600">Detecciones</div>
        </div>
        <div class="bg-green-50 p-3 rounded">
          <div class="text-2xl font-bold text-green-600">{{ totalPersonas }}</div>
          <div class="text-sm text-gray-600">Total Personas</div>
        </div>
        <div class="bg-purple-50 p-3 rounded">
          <div class="text-2xl font-bold text-purple-600">{{ totalCoordenadas }}</div>
          <div class="text-sm text-gray-600">Coordenadas</div>
        </div>
        <div class="bg-orange-50 p-3 rounded">
          <div class="text-2xl font-bold text-orange-600">{{ formatTimestamp(selectedTimestamp, true) }}</div>
          <div class="text-sm text-gray-600">Momento</div>
        </div>
      </div>

      <!-- Canvas del mapa de calor -->
      <div class="relative border border-gray-300 rounded-lg overflow-hidden">
        <canvas 
          ref="heatmapCanvas" 
          :width="canvasWidth" 
          :height="canvasHeight"
          class="block mx-auto"
        ></canvas>
        
        <!-- Leyenda -->
        <div class="absolute top-4 right-4 bg-white bg-opacity-90 p-3 rounded shadow">
          <div class="text-sm font-medium mb-2">Densidad</div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-blue-200 rounded"></div>
            <span class="text-xs">Baja</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-yellow-400 rounded"></div>
            <span class="text-xs">Media</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-red-500 rounded"></div>
            <span class="text-xs">Alta</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sin datos -->
    <div v-else class="flex flex-col items-center justify-center h-64 text-gray-500">
      <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
      </svg>
      <p class="text-lg font-medium">No hay detecciones para mostrar</p>
      <p class="text-sm mt-1">Selecciona un timestamp o carga datos</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
import deteccionesService from '@/services/deteccionesService.js';

// Referencias reactivas
const loading = ref(false);
const error = ref(null);
const selectedTimestamp = ref('');
const uniqueTimestamps = ref([]);
const deteccionesData = ref(null);
const heatmapCanvas = ref(null);
const autoRefresh = ref(false);

// Configuración del canvas
const canvasWidth = 800;
const canvasHeight = 600;

// Intervalo para auto-refresh
let autoRefreshInterval = null;

// Computed properties
const totalPersonas = computed(() => {
  if (!deteccionesData.value?.detecciones) return 0;
  return deteccionesData.value.detecciones.reduce((sum, det) => sum + (det.personas || 0), 0);
});

const totalCoordenadas = computed(() => {
  if (!deteccionesData.value?.detecciones) return 0;
  return deteccionesData.value.detecciones.reduce((sum, det) => sum + (det.coordenadas?.length || 0), 0);
});

// Métodos
const loadTimestamps = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const timestamps = await deteccionesService.getTimestampsUnicos();
    uniqueTimestamps.value = timestamps;
    
    // Si no hay timestamp seleccionado, usar el más reciente
    if (!selectedTimestamp.value && timestamps.length > 0) {
      selectedTimestamp.value = timestamps[0];
      await loadDetecciones();
    }
  } catch (err) {
    error.value = 'Error al cargar los timestamps';
    console.error('Error loading timestamps:', err);
  } finally {
    loading.value = false;
  }
};

const loadDetecciones = async () => {
  if (!selectedTimestamp.value) return;
  
  try {
    loading.value = true;
    error.value = null;
    
    const data = await deteccionesService.fetchDeteccionesPorTimestamp(selectedTimestamp.value);
    deteccionesData.value = data;
    
    nextTick(() => {
      drawHeatmap();
    });
  } catch (err) {
    error.value = 'Error al cargar las detecciones';
    console.error('Error loading detecciones:', err);
  } finally {
    loading.value = false;
  }
};

const useLatestTimestamp = async () => {
  if (uniqueTimestamps.value.length > 0) {
    selectedTimestamp.value = uniqueTimestamps.value[0];
    await loadDetecciones();
  }
};

const drawHeatmap = () => {
  if (!heatmapCanvas.value || !deteccionesData.value?.detecciones) return;
  
  const canvas = heatmapCanvas.value;
  const ctx = canvas.getContext('2d');
  
  // Limpiar canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Dibujar fondo
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Dibujar grilla
  drawGrid(ctx);
  
  // Obtener todas las coordenadas
  const allCoordinates = [];
  deteccionesData.value.detecciones.forEach(deteccion => {
    if (deteccion.coordenadas) {
      allCoordinates.push(...deteccion.coordenadas);
    }
  });
  
  if (allCoordinates.length === 0) return;
  
  // Normalizar coordenadas para que quepan en el canvas
  const maxX = Math.max(...allCoordinates.map(c => c.x));
  const maxY = Math.max(...allCoordinates.map(c => c.y));
  const minX = Math.min(...allCoordinates.map(c => c.x));
  const minY = Math.min(...allCoordinates.map(c => c.y));
  
  const scaleX = (canvasWidth - 100) / (maxX - minX);
  const scaleY = (canvasHeight - 100) / (maxY - minY);
  
  // Crear mapa de densidad
  const density = createDensityMap(allCoordinates, scaleX, scaleY, minX, minY);
  
  // Dibujar mapa de calor
  drawHeatmapPoints(ctx, density);
  
  // Dibujar puntos individuales
  drawPoints(ctx, allCoordinates, scaleX, scaleY, minX, minY);
};

const createDensityMap = (coordinates, scaleX, scaleY, minX, minY) => {
  const gridSize = 20;
  const density = [];
  
  for (let x = 0; x < canvasWidth; x += gridSize) {
    for (let y = 0; y < canvasHeight; y += gridSize) {
      let count = 0;
      const radius = 30;
      
      coordinates.forEach(coord => {
        const pixelX = (coord.x - minX) * scaleX + 50;
        const pixelY = (coord.y - minY) * scaleY + 50;
        
        const distance = Math.sqrt((x - pixelX) ** 2 + (y - pixelY) ** 2);
        if (distance < radius) {
          count += Math.max(0, 1 - distance / radius);
        }
      });
      
      if (count > 0) {
        density.push({ x, y, intensity: count });
      }
    }
  }
  
  return density;
};

const drawHeatmapPoints = (ctx, density) => {
  if (density.length === 0) return;
  
  const maxIntensity = Math.max(...density.map(d => d.intensity));
  
  density.forEach(point => {
    const alpha = point.intensity / maxIntensity;
    const red = Math.floor(255 * alpha);
    const green = Math.floor(255 * (1 - alpha));
    const blue = 100;
    
    ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 15, 0, 2 * Math.PI);
    ctx.fill();
  });
};

const drawPoints = (ctx, coordinates, scaleX, scaleY, minX, minY) => {
  ctx.fillStyle = '#1f2937';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  
  coordinates.forEach((coord, index) => {
    const x = (coord.x - minX) * scaleX + 50;
    const y = (coord.y - minY) * scaleY + 50;
    
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Etiquetar algunos puntos
    if (index % 5 === 0) {
      ctx.fillStyle = '#374151';
      ctx.font = '10px Arial';
      ctx.fillText(`(${coord.x}, ${coord.y})`, x + 6, y - 6);
      ctx.fillStyle = '#1f2937';
    }
  });
};

const drawGrid = (ctx) => {
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  
  // Líneas verticales
  for (let x = 50; x < canvasWidth; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 50);
    ctx.lineTo(x, canvasHeight - 50);
    ctx.stroke();
  }
  
  // Líneas horizontales
  for (let y = 50; y < canvasHeight; y += 50) {
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(canvasWidth - 50, y);
    ctx.stroke();
  }
};

const formatTimestamp = (timestamp, short = false) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  if (short) {
    return date.toLocaleTimeString('es-ES');
  }
  return date.toLocaleString('es-ES');
};

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
  
  if (autoRefresh.value) {
    autoRefreshInterval = setInterval(async () => {
      await useLatestTimestamp();
    }, 5000); // Cada 5 segundos
  } else {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
    }
  }
};

// Lifecycle
onMounted(() => {
  loadTimestamps();
});

onBeforeUnmount(() => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
});
</script>

<style scoped>
canvas {
  border: 1px solid #d1d5db;
  background: #f9fafb;
}
</style>
