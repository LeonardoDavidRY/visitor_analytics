<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Mapa de Calor - Plano Cartesiano</h2>
    
    <div class="mb-4 flex flex-wrap gap-4">
      <!-- Slider de tiempo -->
      <div class="w-full">
        <label class="font-medium mr-2">Control temporal:</label>
        <div class="flex items-center gap-4 mt-2">
          <button 
            @click="togglePlayPause" 
            :class="[
              'px-4 py-2 rounded text-white font-medium',
              isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            ]"
          >
            {{ isPlaying ? '⏸ Pausar' : '▶ Reproducir' }}
          </button>
          
          <div class="flex-1 mx-4">
            <input 
              type="range" 
              v-model="currentTimeIndex" 
              :min="0" 
              :max="availableTimes.length - 1" 
              class="w-full time-slider"
              @input="onTimeSliderChange"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>{{ formatTime(availableTimes[0]) }}</span>
              <span class="font-medium text-blue-600">
                {{ formatTime(currentTime) }}
              </span>
              <span>{{ formatTime(availableTimes[availableTimes.length - 1]) }}</span>
            </div>
          </div>
          
          <div class="text-sm text-gray-600">
            {{ currentTimeIndex + 1 }} / {{ availableTimes.length }}
          </div>
        </div>
      </div>
      
      <!-- Controles de velocidad -->
      <div>
        <label class="font-medium mr-2">Velocidad:</label>
        <select v-model="playbackSpeed" class="border rounded px-2 py-1">
          <option value="0.5">0.5x</option>
          <option value="1">1x</option>
          <option value="2">2x</option>
          <option value="4">4x</option>
        </select>
      </div>
      
      <!-- Control de intensidad -->
      <div>
        <label class="font-medium mr-2">Radio de calor:</label>
        <input 
          type="range" 
          v-model="heatRadius" 
          min="10" 
          max="100" 
          class="w-32"
          @input="updateHeatmap"
        />
        <span class="ml-2 text-sm">{{ heatRadius }}px</span>
      </div>
      
      <!-- Control de opacidad -->
      <div>
        <label class="font-medium mr-2">Intensidad:</label>
        <input 
          type="range" 
          v-model="heatIntensity" 
          min="0.1" 
          max="1" 
          step="0.1"
          class="w-32"
          @input="updateHeatmap"
        />
        <span class="ml-2 text-sm">{{ Math.round(heatIntensity * 100) }}%</span>
      </div>
      
      <!-- Toggle para mostrar puntos -->
      <div class="flex items-center">
        <label class="font-medium mr-2">Mostrar puntos:</label>
        <input 
          type="checkbox" 
          v-model="showPoints"
          @change="updateHeatmap"
          class="w-4 h-4"
        />
      </div>
      
      <!-- Toggle para mostrar histórico -->
      <div class="flex items-center">
        <label class="font-medium mr-2">Mostrar histórico:</label>
        <input 
          type="checkbox" 
          v-model="showHistorical"
          @change="updateHeatmap"
          class="w-4 h-4"
        />
      </div>
    </div>

    <CartesianChart 
      ref="chartRef" 
      @draw-content="drawHeatmap"
      @point-click="onPointClick"
      :canvas-width="1200"
      :canvas-height="800"
      :show-axes="false"
    />
    
    <!-- Leyenda de colores del heatmap -->
    <div class="mt-4">
      <h3 class="font-medium mb-2">Escala de intensidad:</h3>
      <div class="flex items-center gap-2">
        <span class="text-sm">Baja</span>
        <div class="heatmap-legend"></div>
        <span class="text-sm">Alta</span>
        <span class="ml-4 text-sm">
          Máximo: {{ maxPersonas }} personas
        </span>
      </div>
    </div>
    
    <!-- Estadísticas -->
    <div class="mt-4 grid grid-cols-3 gap-4">
      <div class="bg-blue-50 p-3 rounded">
        <div class="text-lg font-bold text-blue-600">{{ filteredData.length }}</div>
        <div class="text-sm text-gray-600">Puntos de calor</div>
      </div>
      <div class="bg-green-50 p-3 rounded">
        <div class="text-lg font-bold text-green-600">{{ totalPersonas }}</div>
        <div class="text-sm text-gray-600">Total personas</div>
      </div>
      <div class="bg-purple-50 p-3 rounded">
        <div class="text-lg font-bold text-purple-600">{{ averagePersonas }}</div>
        <div class="text-sm text-gray-600">Promedio por punto</div>
      </div>
    </div>
    
    <!-- Información del punto seleccionado -->
    <div v-if="selectedPoint" class="mt-4 p-3 bg-gray-50 rounded">
      <h4 class="font-medium">Punto seleccionado:</h4>
      <p class="text-sm">Posición: ({{ selectedPoint.x }}, {{ selectedPoint.y }})</p>
      <p class="text-sm">Personas: {{ selectedPoint.numpersonas }}</p>
      <p class="text-sm">Tiempo: {{ new Date(selectedPoint.time).toLocaleString() }}</p>
      <p class="text-sm">
        Intensidad: {{ Math.round((selectedPoint.numpersonas / maxPersonas) * 100) }}%
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import CartesianChart from './CartesianChart.vue';
import heatmapData from '@/data/heatmap_cartesiano.json';

const chartRef = ref(null);
const heatRadius = ref(50);
const heatIntensity = ref(0.8);
const showPoints = ref(true);
const showHistorical = ref(false);
const selectedPoint = ref(null);

// Variables para control temporal
const currentTimeIndex = ref(0);
const isPlaying = ref(false);
const playbackSpeed = ref(1);
let playInterval = null;

// Datos computados
const availableTimes = computed(() => {
  return [...new Set(heatmapData.map(p => p.time))].sort();
});

const currentTime = computed(() => {
  return availableTimes.value[currentTimeIndex.value] || availableTimes.value[0];
});

const filteredData = computed(() => {
  if (showHistorical.value) {
    // Mostrar datos históricos hasta el tiempo actual
    const currentTimeValue = currentTime.value;
    return heatmapData.filter(point => point.time <= currentTimeValue);
  } else {
    // Mostrar solo datos del tiempo actual
    return heatmapData.filter(point => point.time === currentTime.value);
  }
});

const maxPersonas = computed(() => {
  if (filteredData.value.length === 0) return 1;
  return Math.max(...filteredData.value.map(p => p.numpersonas));
});

const totalPersonas = computed(() => {
  return filteredData.value.reduce((sum, point) => sum + point.numpersonas, 0);
});

const averagePersonas = computed(() => {
  if (filteredData.value.length === 0) return 0;
  return Math.round(totalPersonas.value / filteredData.value.length);
});

// Función para crear gradiente de calor
const createHeatGradient = (ctx, x, y, radius, intensity) => {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  
  // Colores del heatmap: azul -> verde -> amarillo -> rojo
  gradient.addColorStop(0, `rgba(255, 0, 0, ${intensity})`);      // Rojo centro
  gradient.addColorStop(0.3, `rgba(255, 255, 0, ${intensity * 0.8})`); // Amarillo
  gradient.addColorStop(0.6, `rgba(0, 255, 0, ${intensity * 0.6})`);   // Verde
  gradient.addColorStop(0.9, `rgba(0, 0, 255, ${intensity * 0.3})`);   // Azul
  gradient.addColorStop(1, 'rgba(0, 0, 255, 0)');                // Transparente
  
  return gradient;
};

// Función principal de dibujo
const drawHeatmap = (ctx) => {
  if (filteredData.value.length === 0) {
    // Mostrar mensaje cuando no hay datos
    ctx.fillStyle = '#666';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No hay datos de calor para mostrar', 600, 400);
    return;
  }

  // Configurar modo de mezcla para el efecto heatmap
  ctx.globalCompositeOperation = 'multiply';
  
  // Dibujar cada punto de calor
  filteredData.value.forEach(point => {
    const normalizedIntensity = (point.numpersonas / maxPersonas.value) * heatIntensity.value;
    const gradient = createHeatGradient(
      ctx, 
      point.x, 
      point.y, 
      heatRadius.value, 
      normalizedIntensity
    );
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(point.x, point.y, heatRadius.value, 0, 2 * Math.PI);
    ctx.fill();
  });
  
  // Restaurar modo de mezcla
  ctx.globalCompositeOperation = 'source-over';
  
  // Dibujar puntos individuales si está habilitado
  if (showPoints.value) {
    filteredData.value.forEach(point => {
      const normalizedSize = (point.numpersonas / maxPersonas.value) * 10 + 3;
      
      // Punto principal
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(point.x, point.y, normalizedSize, 0, 2 * Math.PI);
      ctx.fill();
      
      // Borde blanco
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Número de personas
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(point.numpersonas.toString(), point.x, point.y + 3);
      
      // Etiqueta con tiempo (solo para puntos grandes)
      if (point.numpersonas > maxPersonas.value * 0.7) {
        ctx.fillStyle = '#333';
        ctx.font = '9px Arial';
        const timeStr = new Date(point.time).toLocaleTimeString();
        ctx.fillText(timeStr, point.x, point.y - normalizedSize - 5);
      }
    });
  }
};

// Funciones para control temporal
const togglePlayPause = () => {
  if (isPlaying.value) {
    pausePlayback();
  } else {
    startPlayback();
  }
};

const startPlayback = () => {
  if (currentTimeIndex.value >= availableTimes.value.length - 1) {
    currentTimeIndex.value = 0; // Reiniciar desde el principio
  }
  
  isPlaying.value = true;
  playInterval = setInterval(() => {
    if (currentTimeIndex.value < availableTimes.value.length - 1) {
      currentTimeIndex.value++;
      updateHeatmap();
    } else {
      // Al llegar al final, pausar o reiniciar
      pausePlayback();
    }
  }, 1000 / playbackSpeed.value); // Ajustar velocidad
};

const pausePlayback = () => {
  isPlaying.value = false;
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
};

const onTimeSliderChange = () => {
  if (isPlaying.value) {
    pausePlayback(); // Pausar al mover manualmente
  }
  updateHeatmap();
};

const formatTime = (timeString) => {
  if (!timeString) return '';
  return new Date(timeString).toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};

// Actualizar heatmap
const updateHeatmap = () => {
  chartRef.value?.redraw();
};

// Manejo de clicks en puntos
const onPointClick = (worldPos) => {
  let closestPoint = null;
  let minDistance = heatRadius.value; // Usar radio de calor como área de detección
  
  filteredData.value.forEach(point => {
    const distance = Math.sqrt(
      Math.pow(worldPos.x - point.x, 2) + 
      Math.pow(worldPos.y - point.y, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = point;
    }
  });
  
  selectedPoint.value = closestPoint;
};

// Watchers
watch([currentTimeIndex, showHistorical], () => {
  selectedPoint.value = null;
  updateHeatmap();
});

watch(playbackSpeed, () => {
  if (isPlaying.value) {
    pausePlayback();
    startPlayback(); // Reiniciar con nueva velocidad
  }
});

onMounted(() => {
  // Inicialización
});

onBeforeUnmount(() => {
  pausePlayback(); // Limpiar interval al desmontar
});
</script>

<style scoped>
.heatmap-legend {
  width: 200px;
  height: 20px;
  background: linear-gradient(
    to right,
    rgba(0, 0, 255, 0.3),
    rgba(0, 255, 0, 0.6),
    rgba(255, 255, 0, 0.8),
    rgba(255, 0, 0, 1)
  );
  border-radius: 10px;
  border: 1px solid #ddd;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: #ddd;
  border-radius: 3px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #3B82F6;
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #3B82F6;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

/* Estilo especial para el slider de tiempo */
.time-slider {
  height: 8px;
  background: linear-gradient(to right, #e5e7eb, #3B82F6);
  border-radius: 4px;
}

.time-slider::-webkit-slider-thumb {
  width: 20px;
  height: 20px;
  background: #1D4ED8;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.time-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #1D4ED8;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

select, input, button {
  transition: all 0.2s ease;
}

select:focus, input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3B82F6;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

button:active {
  transform: translateY(0);
}

/* Animación para el botón de play/pause */
button {
  transition: all 0.3s ease;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}
</style>
