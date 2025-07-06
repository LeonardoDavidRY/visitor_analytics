<template>
  <div class="heatmap-container">
    <!-- Header -->
    <div class="header">
      <h1>🔥 Mapa de Calor - Detección de Personas</h1>
      <p>Visualización en tiempo real de la actividad detectada</p>
      <div class="data-source-badge">
        <span :class="dataSourceInfo.isMock ? 'badge-mock' : 'badge-real'">
          {{ dataSourceInfo.isMock ? '📊 DATOS MOCK' : '🌐 API REAL' }}
        </span>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <!-- Timeline Control -->
      <div class="control-group">
        <label for="timeSlider">Línea de Tiempo:</label>
        <div class="slider-container">
          <input 
            type="range" 
            id="timeSlider" 
            class="time-slider" 
            v-model="currentTimestampIndex"
            @input="onSliderChange"
            :min="0" 
            :max="Math.max(0, (uniqueTimestamps?.length || 1) - 1)"
            :disabled="loading || (uniqueTimestamps?.length || 0) === 0"
          >
        </div>
        <div class="time-display">
          {{ selectedTimestamp ? formatTimestamp(selectedTimestamp) : 'Cargando...' }}
        </div>
      </div>

      <!-- Progress Info -->
      <div class="progress-info">
        <div class="progress-text">
          <span>Progreso: {{ currentTimestampIndex + 1 }} / {{ uniqueTimestamps?.length || 0 }}</span>
          <span class="time-range" v-if="uniqueTimestamps?.length > 0">
            {{ formatTimestamp(uniqueTimestamps[0], true) }} → {{ formatTimestamp(uniqueTimestamps[uniqueTimestamps.length - 1], true) }}
          </span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${(uniqueTimestamps?.length || 0) > 0 ? ((currentTimestampIndex + 1) / (uniqueTimestamps?.length || 1)) * 100 : 0}%` }"
          ></div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalPersonas }}</div>
          <div class="stat-label">Personas Detectadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ deteccionesData?.total_encontradas || 0 }}</div>
          <div class="stat-label">Total Detecciones</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalCoordenadas }}</div>
          <div class="stat-label">Coordenadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatTimestamp(selectedTimestamp, true) }}</div>
          <div class="stat-label">Momento Actual</div>
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="controls-buttons">
        <button 
          @click="play" 
          :disabled="loading || (uniqueTimestamps?.length || 0) === 0"
          class="btn btn-primary"
        >
          {{ autoPlay ? '⏸️ Pausar' : '▶️ Reproducir' }}
        </button>
        <button 
          @click="goToFirst" 
          :disabled="loading || currentTimestampIndex <= 0"
          class="btn btn-secondary"
        >
          ⏮️⏮️ Principio
        </button>
        <button 
          @click="previousTimestamp" 
          :disabled="loading || currentTimestampIndex <= 0"
          class="btn btn-secondary"
        >
          ⏮️ Anterior
        </button>
        <button 
          @click="nextTimestamp" 
          :disabled="loading || currentTimestampIndex >= (uniqueTimestamps?.length || 1) - 1"
          class="btn btn-secondary"
        >
          ⏭️ Siguiente
        </button>
        <button 
          @click="goToLast" 
          :disabled="loading || currentTimestampIndex >= (uniqueTimestamps?.length || 1) - 1"
          class="btn btn-secondary"
        >
          ⏭️⏭️ Final
        </button>
        <button 
          @click="reset" 
          :disabled="loading"
          class="btn btn-secondary"
        >
          🔄 Reiniciar
        </button>
        <button 
          @click="loadTimestamps" 
          :disabled="loading"
          class="btn btn-primary"
        >
          📊 Actualizar Datos
        </button>
      </div>

      <!-- Advanced Controls -->
      <div class="advanced-controls">
        <div class="control-item">
          <label>Velocidad:</label>
          <select 
            v-model="playbackSpeed" 
            @change="updatePlaybackSpeed"
            class="speed-select"
          >
            <option 
              v-for="speed in CONFIG.INTERVALS.PLAYBACK_SPEEDS" 
              :key="speed.value" 
              :value="speed.value"
            >
              {{ speed.label }}
            </option>
          </select>
        </div>
        
        <div class="control-item">
          <button
            @click="togglePersistence"
            :class="['btn', 'btn-toggle', persistData ? 'active' : '']"
          >
            {{ persistData ? '🔒 Datos Fijos' : '🔓 Datos Dinámicos' }}
          </button>
        </div>
        
        <div class="control-item">
          <button
            @click="clearCanvas"
            class="btn btn-danger"
          >
            🧹 Limpiar Canvas
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando datos de detección...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error">
      {{ error }}
    </div>

    <!-- Visualization -->
    <div v-if="!loading && !error" class="visualization">
      <div class="heatmap-canvas-container">
        <canvas 
          ref="heatmapCanvas" 
          :width="canvasWidth" 
          :height="canvasHeight"
          class="heatmap-canvas"
        ></canvas>
        
        <!-- Legend -->
        <div class="legend">
          <h4>Leyenda</h4>
          <div class="legend-item">
            <div class="legend-color person-detected"></div>
            <span>Persona detectada</span>
          </div>
          <div class="legend-item">
            <div class="legend-color high-activity"></div>
            <span>Zona de alta actividad</span>
          </div>
          <div class="legend-item">
            <div class="legend-color medium-activity"></div>
            <span>Actividad media</span>
          </div>
          <div class="legend-item">
            <div class="legend-color low-activity"></div>
            <span>Actividad baja</span>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-if="!loading && !error && (!deteccionesData || !deteccionesData.success)" class="no-data">
      <div class="no-data-icon">📊</div>
      <h3>No hay detecciones para mostrar</h3>
      <p>Selecciona un timestamp o carga datos para visualizar el mapa de calor</p>
      <button @click="loadTimestamps" class="btn btn-primary">
        Cargar Datos
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
import { CONFIG, getDeteccionesService, getDataSourceInfo } from '@/config/deteccionesConfig.js';

// Servicio de detecciones (se cargará dinámicamente)
let deteccionesService = null;

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
const playbackSpeed = ref(CONFIG.INTERVALS.DEFAULT_PLAYBACK);
const lastDrawnData = ref(null);

// Configuración del canvas
const canvasWidth = CONFIG.CANVAS.WIDTH;
const canvasHeight = CONFIG.CANVAS.HEIGHT;

// Información sobre el origen de los datos
const dataSourceInfo = getDataSourceInfo();

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

// Métodos principales
const play = () => {
  if (autoPlay.value) {
    // Si está reproduciendo, pausar
    toggleAutoPlay();
  } else {
    // Si está pausado, reproducir
    toggleAutoPlay();
  }
};

const reset = async () => {
  try {
    // Detener auto-play si está activo
    if (autoPlay.value) {
      toggleAutoPlay();
    }
    
    // Ir al primer timestamp (principio cronológico)
    currentTimestampIndex.value = 0;
    if (uniqueTimestamps.value.length > 0) {
      selectedTimestamp.value = uniqueTimestamps.value[0];
      await loadDetecciones();
    }
  } catch (err) {
    console.error('Error en reset:', err);
  }
};

const goToFirst = async () => {
  try {
    currentTimestampIndex.value = 0;
    if (uniqueTimestamps.value.length > 0) {
      selectedTimestamp.value = uniqueTimestamps.value[0];
      await loadDetecciones();
    }
  } catch (err) {
    console.error('Error en goToFirst:', err);
  }
};

const goToLast = async () => {
  try {
    currentTimestampIndex.value = uniqueTimestamps.value.length - 1;
    if (uniqueTimestamps.value.length > 0) {
      selectedTimestamp.value = uniqueTimestamps.value[uniqueTimestamps.value.length - 1];
      await loadDetecciones();
    }
  } catch (err) {
    console.error('Error en goToLast:', err);
  }
};

const loadTimestamps = async () => {
  if (!deteccionesService) {
    console.error('❌ Servicio de detecciones no inicializado');
    error.value = 'Servicio no disponible';
    return;
  }
  
  try {
    loading.value = true;
    error.value = null;
    
    const timestamps = await deteccionesService.getTimestampsUnicos();
    uniqueTimestamps.value = timestamps;
    
    console.log('📅 Timestamps cargados:', timestamps.length);
    console.log('📅 Primer timestamp (más antiguo):', timestamps[0]);
    console.log('📅 Último timestamp (más reciente):', timestamps[timestamps.length - 1]);
    
    // Si no hay timestamp seleccionado, usar el primer timestamp cronológico (más antiguo)
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
  
  if (!deteccionesService) {
    console.error('❌ Servicio de detecciones no inicializado');
    error.value = 'Servicio no disponible';
    return;
  }
  
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
    // Ahora que están ordenados cronológicamente, el último índice es el más reciente
    currentTimestampIndex.value = uniqueTimestamps.value.length - 1;
    selectedTimestamp.value = uniqueTimestamps.value[uniqueTimestamps.value.length - 1];
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
    ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
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
    ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
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
      
      // Validar que las coordenadas tengan el formato correcto
      const validCoordinates = deteccion.coordenadas.filter(coord => 
        coord && typeof coord.x === 'number' && typeof coord.y === 'number'
      );
      console.log(`✅ Coordenadas válidas: ${validCoordinates.length}/${deteccion.coordenadas.length}`);
      
      allCoordinates.push(...validCoordinates);
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
  const gridSize = CONFIG.CANVAS.GRID_SIZE;
  const density = [];
  
  for (let x = 0; x < canvasWidth; x += gridSize) {
    for (let y = 0; y < canvasHeight; y += gridSize) {
      let count = 0;
      const radius = CONFIG.CANVAS.HEATMAP_RADIUS;
      
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
    
    // Efecto de pulsación - círculo exterior
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Círculo principal de la persona
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Número de persona en el centro
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((index + 1).toString(), x, y);
    
    // Información de coordenadas cada 3 puntos
    if (index % 3 === 0) {
      ctx.fillStyle = CONFIG.COLORS.TEXT;
      ctx.font = 'bold 10px Arial';
      ctx.strokeStyle = CONFIG.COLORS.POINT_BORDER;
      ctx.lineWidth = 2;
      ctx.strokeText(`(${Math.round(coord.x)}, ${Math.round(coord.y)})`, x + 12, y - 12);
      ctx.fillText(`(${Math.round(coord.x)}, ${Math.round(coord.y)})`, x + 12, y - 12);
    }
  });
  
  // Dibujar información de la detección en la esquina
  if (coordinates.length > 0) {
    const info = `${coordinates.length} persona${coordinates.length !== 1 ? 's' : ''} detectada${coordinates.length !== 1 ? 's' : ''}`;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 280, 35);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(info, 20, 27);
  }
  
  console.log('✅ Puntos dibujados exitosamente');
};

const drawGrid = (ctx) => {
  ctx.strokeStyle = CONFIG.COLORS.GRID;
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
      }, CONFIG.INTERVALS.AUTO_REFRESH);
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
    ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
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
    
    // Cargar el servicio de detecciones dinámicamente
    deteccionesService = await getDeteccionesService();
    console.log('📡 Servicio de detecciones cargado:', dataSourceInfo);
    
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.heatmap-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.heatmap-container > div {
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
  position: relative;
}

.header h1 {
  font-size: 2.5em;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header p {
  font-size: 1.2em;
  opacity: 0.9;
}

.data-source-badge {
  position: absolute;
  top: 20px;
  right: 20px;
}

.badge-mock {
  background: rgba(34, 197, 94, 0.9);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.badge-real {
  background: rgba(59, 130, 246, 0.9);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.controls {
  padding: 30px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.control-group label {
  font-weight: 600;
  color: #495057;
  min-width: 120px;
}

.slider-container {
  flex: 1;
  min-width: 300px;
}

.time-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.time-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.time-slider::-webkit-slider-thumb:hover {
  background: #5a6fd8;
  transform: scale(1.1);
}

.time-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.time-display {
  background: #667eea;
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: 600;
  min-width: 200px;
  text-align: center;
  white-space: nowrap;
}

/* Progress Info */
.progress-info {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.time-range {
  font-size: 0.8rem;
  opacity: 0.8;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  transition: width 0.3s ease;
  border-radius: 3px;
}

.stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  text-align: center;
  flex: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.stat-value {
  font-size: 2.2em;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9em;
  font-weight: 500;
}

.controls-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.advanced-controls {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-item label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9em;
}

.speed-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9em;
  background: white;
  cursor: pointer;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

.btn-toggle {
  background: #e9ecef;
  color: #495057;
}

.btn-toggle.active {
  background: #28a745;
  color: white;
}

.btn-toggle:hover:not(:disabled) {
  background: #dee2e6;
  transform: translateY(-2px);
}

.btn-toggle.active:hover:not(:disabled) {
  background: #218838;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #6c757d;
  background: white;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  font-size: 1.1em;
  font-weight: 500;
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 20px;
  border-radius: 8px;
  margin: 20px;
  border: 1px solid #f5c6cb;
  font-weight: 500;
}

.visualization {
  padding: 30px;
  background: white;
}

.heatmap-canvas-container {
  position: relative;
  width: 100%;
  height: 600px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.heatmap-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
  display: block;
}

.legend {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 20;
  backdrop-filter: blur(10px);
}

.legend h4 {
  margin-bottom: 15px;
  color: #495057;
  font-weight: 600;
  font-size: 1em;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.legend-color.person-detected {
  background: #ff6b6b;
}

.legend-color.high-activity {
  background: #ff3838;
}

.legend-color.medium-activity {
  background: #ffd93d;
}

.legend-color.low-activity {
  background: #74c0fc;
}

.legend-item span {
  font-size: 0.9em;
  color: #495057;
  font-weight: 500;
}

.no-data {
  text-align: center;
  padding: 80px 40px;
  color: #6c757d;
  background: white;
}

.no-data-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.no-data h3 {
  font-size: 1.5em;
  margin-bottom: 10px;
  color: #495057;
}

.no-data p {
  font-size: 1.1em;
  margin-bottom: 30px;
  opacity: 0.8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .heatmap-container {
    padding: 10px;
  }
  
  .header {
    padding: 20px;
  }
  
  .header h1 {
    font-size: 2em;
  }
  
  .controls {
    padding: 20px;
  }
  
  .control-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group label {
    min-width: auto;
  }
  
  .slider-container {
    min-width: auto;
  }
  
  .time-display {
    min-width: auto;
  }
  
  .stats {
    flex-direction: column;
  }
  
  .stat-card {
    min-width: auto;
  }
  
  .controls-buttons {
    flex-direction: column;
  }
  
  .advanced-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-item {
    justify-content: space-between;
  }
  
  .visualization {
    padding: 20px;
  }
  
  .heatmap-canvas-container {
    height: 400px;
  }
  
  .legend {
    position: relative;
    top: auto;
    right: auto;
    margin-top: 20px;
  }
  
  .data-source-badge {
    position: relative;
    top: auto;
    right: auto;
    margin-top: 15px;
  }
}

/* Animaciones adicionales */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: fadeInUp 0.5s ease;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }
</style>
