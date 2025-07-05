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
        <button
          @click="toggleAutoPlay"
          :class="[
            'px-3 py-1 rounded text-sm',
            autoPlay ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          {{ autoPlay ? '⏸ Play' : '▶ Play' }}
        </button>
        <button
          @click="togglePersistence"
          :class="[
            'px-3 py-1 rounded text-sm',
            persistData ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          {{ persistData ? '🔒 Fijar' : '🔓 Fijar' }}
        </button>
      </div>
    </div>

    <!-- Slider de timestamp -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Navegar por momentos temporales:
      </label>
      
      <!-- Información del timestamp actual -->
      <div class="bg-gray-50 p-3 rounded-lg mb-3">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-lg font-semibold text-gray-800">
              {{ selectedTimestamp ? formatTimestamp(selectedTimestamp) : 'Sin selección' }}
            </div>
            <div class="text-sm text-gray-600">
              {{ currentTimestampIndex >= 0 && uniqueTimestamps?.length > 0 ? `${currentTimestampIndex + 1} de ${uniqueTimestamps.length}` : 'No hay datos' }}
            </div>
          </div>
          <button
            @click="useLatestTimestamp"
            :disabled="loading || uniqueTimestamps.length === 0"
            class="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 text-sm"
          >
            Más Reciente
          </button>
        </div>
      </div>

      <!-- Controles de navegación -->
      <div class="flex items-center gap-3 mb-3">
        <button
          @click="previousTimestamp"
          :disabled="loading || currentTimestampIndex <= 0"
          class="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Anterior
        </button>
        
        <div class="flex-1 px-2">
          <input
            type="range"
            v-model="currentTimestampIndex"
            @input="onSliderChange"
            :min="0"
            :max="Math.max(0, (uniqueTimestamps?.length || 1) - 1)"
            :disabled="loading || (uniqueTimestamps?.length || 0) === 0"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          >
        </div>
        
        <button
          @click="nextTimestamp"
          :disabled="loading || currentTimestampIndex >= (uniqueTimestamps?.length || 1) - 1"
          class="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
        >
          Siguiente
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      
      <!-- Indicador de progreso -->
      <div class="w-full bg-gray-200 rounded-full h-1">
        <div 
          class="bg-blue-500 h-1 rounded-full transition-all duration-300"
          :style="{ width: `${(uniqueTimestamps?.length || 0) > 0 ? ((currentTimestampIndex + 1) / (uniqueTimestamps?.length || 1)) * 100 : 0}%` }"
        ></div>
      </div>
      
      <!-- Controles adicionales -->
      <div class="flex justify-between items-center mt-3 text-sm">
        <div class="flex items-center gap-3">
          <label class="text-gray-600">Velocidad:</label>
          <select 
            v-model="playbackSpeed" 
            @change="updatePlaybackSpeed"
            class="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="500">Muy Rápido (0.5s)</option>
            <option value="1000">Rápido (1s)</option>
            <option value="2000">Normal (2s)</option>
            <option value="3000">Lento (3s)</option>
            <option value="5000">Muy Lento (5s)</option>
          </select>
        </div>
        
        <div class="flex items-center gap-3">
          <span class="text-gray-600">
            Estado: 
            <span :class="getStatusClass()">{{ getStatusText() }}</span>
          </span>
          <button
            @click="clearCanvas"
            class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Limpiar
          </button>
        </div>
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
const currentTimestampIndex = ref(-1);
const uniqueTimestamps = ref([]);
const deteccionesData = ref(null);
const heatmapCanvas = ref(null);
const autoRefresh = ref(false);
const autoPlay = ref(false);
const persistData = ref(false);
const playbackSpeed = ref(2000);
const lastDrawnData = ref(null);

// Configuración del canvas
const canvasWidth = 800;
const canvasHeight = 600;

// Intervalo para auto-refresh - inicializar como null
let autoRefreshInterval = null;
let autoPlayInterval = null;

// Computed properties con protecciones
const totalPersonas = computed(() => {
  try {
    if (!deteccionesData.value?.detecciones || !Array.isArray(deteccionesData.value.detecciones)) return 0;
    return deteccionesData.value.detecciones.reduce((sum, det) => {
      return sum + (det?.personas || 0);
    }, 0);
  } catch (err) {
    console.error('Error calculando totalPersonas:', err);
    return 0;
  }
});

const totalCoordenadas = computed(() => {
  try {
    if (!deteccionesData.value?.detecciones || !Array.isArray(deteccionesData.value.detecciones)) return 0;
    return deteccionesData.value.detecciones.reduce((sum, det) => {
      return sum + (det?.coordenadas?.length || 0);
    }, 0);
  } catch (err) {
    console.error('Error calculando totalCoordenadas:', err);
    return 0;
  }
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
      currentTimestampIndex.value = 0;
      selectedTimestamp.value = timestamps[0];
      await loadDetecciones();
    } else if (selectedTimestamp.value && timestamps.length > 0) {
      // Mantener la selección actual si existe
      const currentIndex = timestamps.findIndex(t => t === selectedTimestamp.value);
      currentTimestampIndex.value = currentIndex >= 0 ? currentIndex : 0;
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
    
    console.log('🔍 Cargando detecciones para timestamp:', selectedTimestamp.value);
    const data = await deteccionesService.fetchDeteccionesPorTimestamp(selectedTimestamp.value);
    console.log('📊 Datos recibidos:', data);
    
    // Solo actualizar si no está en modo persistencia o si es la primera vez
    if (!persistData.value || !deteccionesData.value) {
      deteccionesData.value = data;
      lastDrawnData.value = data;
    }
    
    // Validar estructura de datos
    if (data && data.detecciones) {
      const totalCoords = data.detecciones.reduce((sum, det) => sum + (det.coordenadas?.length || 0), 0);
      console.log(`📍 Total de coordenadas encontradas: ${totalCoords}`);
    }
    
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
    currentTimestampIndex.value = 0;
    selectedTimestamp.value = uniqueTimestamps.value[0];
    await loadDetecciones();
  }
};

// Funciones de navegación del slider
const onSliderChange = async () => {
  if (uniqueTimestamps.value.length > 0 && currentTimestampIndex.value >= 0) {
    selectedTimestamp.value = uniqueTimestamps.value[currentTimestampIndex.value];
    await loadDetecciones();
  }
};

const previousTimestamp = async () => {
  if (currentTimestampIndex.value > 0) {
    currentTimestampIndex.value--;
    selectedTimestamp.value = uniqueTimestamps.value[currentTimestampIndex.value];
    await loadDetecciones();
  }
};

const nextTimestamp = async () => {
  if (currentTimestampIndex.value < uniqueTimestamps.value.length - 1) {
    currentTimestampIndex.value++;
    selectedTimestamp.value = uniqueTimestamps.value[currentTimestampIndex.value];
    await loadDetecciones();
  }
};

const drawHeatmap = () => {
  if (!heatmapCanvas.value) {
    console.log('⚠️ No hay canvas disponible');
    return;
  }
  
  // Usar datos persistidos si está activado el modo persistencia
  const dataToUse = persistData.value && lastDrawnData.value ? lastDrawnData.value : deteccionesData.value;
  
  if (!dataToUse?.detecciones) {
    console.log('⚠️ No hay datos para dibujar');
    console.log('Datos disponibles:', dataToUse);
    console.log('Modo persistencia:', persistData.value);
    
    // Dibujar canvas vacío
    const canvas = heatmapCanvas.value;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    drawGrid(ctx);
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No hay coordenadas para mostrar', canvasWidth / 2, canvasHeight / 2);
    return;
  }
  
  const canvas = heatmapCanvas.value;
  const ctx = canvas.getContext('2d');
  
  // Limpiar canvas solo si no está en modo persistencia
  if (!persistData.value) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Dibujar fondo
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Dibujar grilla
    drawGrid(ctx);
  }
  
  // Obtener todas las coordenadas
  const allCoordinates = [];
  console.log('🔍 Estructura de detecciones:', dataToUse.detecciones);
  
  dataToUse.detecciones.forEach((deteccion, index) => {
    console.log(`🔍 Detección ${index}:`, deteccion);
    if (deteccion.coordenadas && Array.isArray(deteccion.coordenadas)) {
      console.log(`📌 Procesando ${deteccion.coordenadas.length} coordenadas de detección ID: ${deteccion.id}`);
      console.log('📍 Coordenadas:', deteccion.coordenadas);
      allCoordinates.push(...deteccion.coordenadas);
    } else {
      console.warn('⚠️ Detección sin coordenadas válidas:', deteccion);
    }
  });
  
  console.log(`🗺️ Total coordenadas para mapa de calor: ${allCoordinates.length}`);
  console.log('📍 Todas las coordenadas:', allCoordinates);
  
  if (allCoordinates.length === 0) {
    console.log('⚠️ No hay coordenadas para dibujar');
    return;
  }
  
  // Log de algunas coordenadas para debug
  console.log('📍 Primeras 3 coordenadas:', allCoordinates.slice(0, 3));
  
  // Normalizar coordenadas para que quepan en el canvas
  const maxX = Math.max(...allCoordinates.map(c => c.x));
  const maxY = Math.max(...allCoordinates.map(c => c.y));
  const minX = Math.min(...allCoordinates.map(c => c.x));
  const minY = Math.min(...allCoordinates.map(c => c.y));
  
  console.log(`📏 Rango X: ${minX} - ${maxX}, Rango Y: ${minY} - ${maxY}`);
  
  const scaleX = (canvasWidth - 100) / (maxX - minX || 1);
  const scaleY = (canvasHeight - 100) / (maxY - minY || 1);
  
  console.log(`📐 Escalas - X: ${scaleX.toFixed(2)}, Y: ${scaleY.toFixed(2)}`);
  
  // Crear mapa de densidad
  const density = createDensityMap(allCoordinates, scaleX, scaleY, minX, minY);
  console.log(`🔥 Puntos de densidad creados: ${density.length}`);
  
  // Dibujar mapa de calor
  drawHeatmapPoints(ctx, density);
  
  // Dibujar puntos individuales
  drawPoints(ctx, allCoordinates, scaleX, scaleY, minX, minY);
  
  // Guardar datos dibujados si no está en modo persistencia
  if (!persistData.value) {
    lastDrawnData.value = dataToUse;
  }
  
  console.log('✅ Mapa de calor dibujado exitosamente');
  console.log('🔒 Modo persistencia:', persistData.value);
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
  if (density.length === 0) {
    console.log('⚠️ No hay densidad para dibujar');
    return;
  }
  
  console.log(`🔥 Dibujando ${density.length} puntos de densidad`);
  const maxIntensity = Math.max(...density.map(d => d.intensity));
  console.log(`🔥 Intensidad máxima: ${maxIntensity}`);
  
  density.forEach((point, index) => {
    const alpha = Math.min(point.intensity / maxIntensity, 1);
    
    // Gradiente de colores más visible: azul -> verde -> amarillo -> rojo
    let red, green, blue;
    if (alpha < 0.33) {
      // Azul a verde
      red = 0;
      green = Math.floor(255 * (alpha / 0.33));
      blue = Math.floor(255 * (1 - alpha / 0.33));
    } else if (alpha < 0.66) {
      // Verde a amarillo
      red = Math.floor(255 * ((alpha - 0.33) / 0.33));
      green = 255;
      blue = 0;
    } else {
      // Amarillo a rojo
      red = 255;
      green = Math.floor(255 * (1 - (alpha - 0.66) / 0.34));
      blue = 0;
    }
    
    ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${Math.max(alpha * 0.8, 0.3)})`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 20 + alpha * 10, 0, 2 * Math.PI);
    ctx.fill();
    
    if (index < 5) {
      console.log(`Punto densidad ${index}: (${point.x}, ${point.y}) intensidad: ${point.intensity.toFixed(2)} alpha: ${alpha.toFixed(2)}`);
    }
  });
  
  console.log('✅ Mapa de calor dibujado exitosamente');
};

const drawPoints = (ctx, coordinates, scaleX, scaleY, minX, minY) => {
  console.log(`🎨 Dibujando ${coordinates.length} puntos individuales`);
  
  coordinates.forEach((coord, index) => {
    const x = (coord.x - minX) * scaleX + 50;
    const y = (coord.y - minY) * scaleY + 50;
    
    console.log(`Punto ${index}: (${coord.x}, ${coord.y}) -> canvas (${x.toFixed(1)}, ${y.toFixed(1)})`);
    
    // Dibujar círculo principal
    ctx.fillStyle = '#dc2626'; // Rojo más visible
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    // Borde blanco
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Punto central
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Etiquetar algunos puntos con mayor espaciado
    if (index % 3 === 0) {
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 11px Arial';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeText(`(${Math.round(coord.x)}, ${Math.round(coord.y)})`, x + 8, y - 8);
      ctx.fillText(`(${Math.round(coord.x)}, ${Math.round(coord.y)})`, x + 8, y - 8);
    }
  });
  
  console.log('✅ Puntos dibujados exitosamente');
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
  try {
    autoRefresh.value = !autoRefresh.value;
    
    if (autoRefresh.value) {
      autoRefreshInterval = setInterval(async () => {
        try {
          await useLatestTimestamp();
        } catch (err) {
          console.error('Error en auto-refresh:', err);
        }
      }, 5000);
    } else {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
      }
    }
  } catch (err) {
    console.error('Error en toggleAutoRefresh:', err);
  }
};

const toggleAutoPlay = () => {
  try {
    autoPlay.value = !autoPlay.value;
    
    if (autoPlay.value) {
      autoPlayInterval = setInterval(async () => {
        try {
          if (currentTimestampIndex.value < uniqueTimestamps.value.length - 1) {
            await nextTimestamp();
          } else {
            // Al llegar al final, volver al principio
            currentTimestampIndex.value = 0;
            if (uniqueTimestamps.value.length > 0) {
              selectedTimestamp.value = uniqueTimestamps.value[0];
              await loadDetecciones();
            }
          }
        } catch (err) {
          console.error('Error en auto-play:', err);
        }
      }, playbackSpeed.value);
    } else {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }
  } catch (err) {
    console.error('Error en toggleAutoPlay:', err);
  }
};

const togglePersistence = () => {
  try {
    persistData.value = !persistData.value;
    
    if (!persistData.value) {
      // Si se desactiva la persistencia, redibujar con los datos actuales
      nextTick(() => {
        try {
          drawHeatmap();
        } catch (err) {
          console.error('Error redibujando heatmap:', err);
        }
      });
    }
  } catch (err) {
    console.error('Error en togglePersistence:', err);
  }
};

const updatePlaybackSpeed = () => {
  try {
    // Si está reproduciendo, reiniciar con nueva velocidad
    if (autoPlay.value) {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
      
      autoPlayInterval = setInterval(async () => {
        try {
          if (currentTimestampIndex.value < uniqueTimestamps.value.length - 1) {
            await nextTimestamp();
          } else {
            currentTimestampIndex.value = 0;
            if (uniqueTimestamps.value.length > 0) {
              selectedTimestamp.value = uniqueTimestamps.value[0];
              await loadDetecciones();
            }
          }
        } catch (err) {
          console.error('Error en playback interval:', err);
        }
      }, parseInt(playbackSpeed.value) || 2000);
    }
  } catch (err) {
    console.error('Error en updatePlaybackSpeed:', err);
  }
};

const clearCanvas = () => {
  if (heatmapCanvas.value) {
    const canvas = heatmapCanvas.value;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Dibujar fondo y grilla
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    drawGrid(ctx);
    
    // Mensaje de canvas limpio
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Canvas limpiado - Selecciona un timestamp para ver datos', canvasWidth / 2, canvasHeight / 2);
  }
  
  // Limpiar datos si no está en modo persistencia
  if (!persistData.value) {
    deteccionesData.value = null;
    lastDrawnData.value = null;
  }
};

const getStatusClass = () => {
  try {
    if (loading.value) return 'text-yellow-600 font-medium';
    if (autoPlay.value) return 'text-green-600 font-medium';
    if (persistData.value) return 'text-blue-600 font-medium';
    return 'text-gray-600';
  } catch (err) {
    console.error('Error en getStatusClass:', err);
    return 'text-gray-600';
  }
};

const getStatusText = () => {
  try {
    if (loading.value) return 'Cargando...';
    if (autoPlay.value) return 'Reproduciendo';
    if (persistData.value) return 'Datos Fijos';
    return 'Listo';
  } catch (err) {
    console.error('Error en getStatusText:', err);
    return 'Error';
  }
};

// Función de validación del componente
const validateComponent = () => {
  try {
    const validationErrors = [];
    
    if (!uniqueTimestamps || !Array.isArray(uniqueTimestamps.value)) {
      validationErrors.push('uniqueTimestamps no es válido');
    }
    
    if (currentTimestampIndex.value < -1) {
      validationErrors.push('currentTimestampIndex inválido');
    }
    
    if (playbackSpeed.value <= 0) {
      validationErrors.push('playbackSpeed inválido');
    }
    
    if (validationErrors.length > 0) {
      console.warn('⚠️ Errores de validación:', validationErrors);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error en validateComponent:', err);
    return false;
  }
};

// Lifecycle hooks con protecciones
onMounted(async () => {
  try {
    console.log('🚀 Componente DeteccionesHeatmap montado');
    await loadTimestamps();
  } catch (err) {
    console.error('Error en onMounted:', err);
    error.value = 'Error al inicializar el componente';
  }
});

onBeforeUnmount(() => {
  try {
    console.log('🧹 Limpiando intervalos en DeteccionesHeatmap');
    
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
    }
    
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
    
    console.log('✅ Limpieza completada');
  } catch (err) {
    console.error('Error en onBeforeUnmount:', err);
  }
});
</script>

<style scoped>
canvas {
  border: 1px solid #d1d5db;
  background: #f9fafb;
}

/* Estilos para el slider */
.slider {
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.slider:hover {
  opacity: 1;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  background: #2563eb;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
