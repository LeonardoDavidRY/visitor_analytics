<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Rutas de Personas - Plano Cartesiano</h2>
    
    <div class="mb-4 flex flex-wrap gap-4">
      <!-- Filtro por persona -->
      <div>
        <label class="font-medium mr-2">Filtrar por persona:</label>
        <select v-model="selectedId" class="border rounded px-2 py-1">
          <option value="">Todas las personas</option>
          <option v-for="id in personIds" :key="id" :value="id">
            Persona {{ id }}
          </option>
        </select>
      </div>
      
      <!-- Filtro por cámara -->
      <div>
        <label class="font-medium mr-2">Filtrar por cámara:</label>
        <select v-model="selectedCamera" class="border rounded px-2 py-1">
          <option value="">Todas las cámaras</option>
          <option v-for="cam in cameras" :key="cam" :value="cam">
            Cámara {{ cam }}
          </option>
        </select>
      </div>
      
      <!-- Toggle animación -->
      <div class="flex items-center">
        <label class="font-medium mr-2">Animación:</label>
        <button 
          @click="toggleAnimation"
          :class="[
            'px-3 py-1 rounded text-sm transition-colors',
            isAnimating ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          ]"
        >
          {{ isAnimating ? 'Pausar' : 'Reproducir' }}
        </button>
      </div>
    </div>

    <CartesianChart 
      ref="chartRef" 
      @draw-content="drawRoutes"
      @point-click="onPointClick"
      :canvas-width="1200"
      :canvas-height="800"
      :show-axes="false"
    />
    
    <!-- Leyenda de colores -->
    <div class="mt-4">
      <h3 class="font-medium mb-2">Leyenda:</h3>
      <div class="flex flex-wrap gap-3">
        <div v-for="(person, index) in visibleRoutes" :key="person.id" 
             class="flex items-center gap-2">
          <div 
            :style="{ 
              width: '20px', 
              height: '4px', 
              backgroundColor: routeColors[index % routeColors.length] 
            }"
            class="rounded"
          ></div>
          <span class="text-sm">
            Persona {{ person.id }} (Cámara {{ person.id_camara }})
          </span>
        </div>
      </div>
    </div>
    
    <!-- Información de animación -->
    <div v-if="isAnimating" class="mt-4 p-3 bg-blue-50 rounded">
      <p class="text-sm text-blue-800">
        🎬 Reproduciendo animación... Paso {{ animationStep + 1 }} de {{ maxAnimationSteps }}
      </p>
    </div>
    
    <!-- Información del punto seleccionado -->
    <div v-if="selectedPoint" class="mt-4 p-3 bg-gray-50 rounded">
      <h4 class="font-medium">Punto seleccionado:</h4>
      <p class="text-sm">Persona ID: {{ selectedPoint.personId }}</p>
      <p class="text-sm">Posición: ({{ selectedPoint.x }}, {{ selectedPoint.y }})</p>
      <p class="text-sm">Tiempo: {{ selectedPoint.time }}</p>
      <p class="text-sm">Cámara: {{ selectedPoint.camera }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import CartesianChart from './CartesianChart.vue';
import routeData from '@/data/rutas_cartesianas.json';

const chartRef = ref(null);
const selectedId = ref('');
const selectedCamera = ref('');
const selectedPoint = ref(null);
const isAnimating = ref(false);
const animationStep = ref(0);
const animationInterval = ref(null);

const routeColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
  '#00D2D3', '#FF9F43', '#EE5A24', '#0ABDE3'
];

// Datos computados
const personIds = computed(() => {
  return [...new Set(routeData.map(p => p.id))].sort((a, b) => a - b);
});

const cameras = computed(() => {
  return [...new Set(routeData.map(p => p.id_camara))].sort((a, b) => a - b);
});

const visibleRoutes = computed(() => {
  return routeData.filter(person => {
    const matchesId = !selectedId.value || person.id === parseInt(selectedId.value);
    const matchesCamera = !selectedCamera.value || person.id_camara === parseInt(selectedCamera.value);
    return matchesId && matchesCamera;
  });
});

const maxAnimationSteps = computed(() => {
  if (visibleRoutes.value.length === 0) return 0;
  return Math.max(...visibleRoutes.value.map(p => p.posicion.length));
});

// Funciones de animación
const toggleAnimation = () => {
  if (isAnimating.value) {
    stopAnimation();
  } else {
    startAnimation();
  }
};

const startAnimation = () => {
  if (maxAnimationSteps.value === 0) return;
  
  isAnimating.value = true;
  animationStep.value = 0;
  
  animationInterval.value = setInterval(() => {
    animationStep.value++;
    chartRef.value?.redraw();
    
    if (animationStep.value >= maxAnimationSteps.value) {
      animationStep.value = 0; // Reiniciar animación
    }
  }, 800); // 800ms entre pasos
};

const stopAnimation = () => {
  isAnimating.value = false;
  if (animationInterval.value) {
    clearInterval(animationInterval.value);
    animationInterval.value = null;
  }
  animationStep.value = maxAnimationSteps.value; // Mostrar todo
  chartRef.value?.redraw();
};

// Función principal de dibujo
const drawRoutes = (ctx) => {
  if (visibleRoutes.value.length === 0) {
    // Mostrar mensaje cuando no hay datos
    ctx.fillStyle = '#666';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No hay rutas para mostrar', 600, 400);
    return;
  }

  visibleRoutes.value.forEach((person, personIndex) => {
    const color = routeColors[personIndex % routeColors.length];
    const positions = person.posicion;
    
    // Determinar cuántos puntos mostrar según la animación
    const pointsToShow = isAnimating.value 
      ? Math.min(animationStep.value + 1, positions.length)
      : positions.length;
    
    if (pointsToShow === 0) return;
    
    // Dibujar línea de ruta
    if (pointsToShow > 1) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      for (let i = 0; i < pointsToShow; i++) {
        const pos = positions[i];
        if (i === 0) {
          ctx.moveTo(pos.x, pos.y);
        } else {
          ctx.lineTo(pos.x, pos.y);
        }
      }
      ctx.stroke();
    }
    
    // Dibujar puntos de posición
    for (let i = 0; i < pointsToShow; i++) {
      const pos = positions[i];
      const isFirst = i === 0;
      const isLast = i === positions.length - 1;
      const isCurrent = isAnimating.value && i === pointsToShow - 1;
      
      // Punto principal
      ctx.fillStyle = color;
      ctx.beginPath();
      const radius = isFirst ? 10 : (isLast ? 8 : 6);
      ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Borde del punto
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Punto pulsante para posición actual en animación
      if (isCurrent) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 5, 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      // Número de secuencia
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText((i + 1).toString(), pos.x, pos.y + 3);
      
      // Tiempo en el primer y último punto
      if (isFirst || isLast) {
        ctx.fillStyle = '#333';
        ctx.font = '11px Arial';
        const timeStr = new Date(pos.time).toLocaleTimeString();
        ctx.fillText(timeStr, pos.x, pos.y - 15);
      }
    }
    
    // Etiqueta de persona (solo en el primer punto)
    if (pointsToShow > 0) {
      const firstPos = positions[0];
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(
        `ID: ${person.id} (Cam: ${person.id_camara})`, 
        firstPos.x + 15, 
        firstPos.y - 15
      );
    }
  });
};

// Manejo de clicks en puntos
const onPointClick = (worldPos) => {
  let closestPoint = null;
  let minDistance = 20; // Radio de detección
  
  visibleRoutes.value.forEach(person => {
    person.posicion.forEach(pos => {
      const distance = Math.sqrt(
        Math.pow(worldPos.x - pos.x, 2) + 
        Math.pow(worldPos.y - pos.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = {
          personId: person.id,
          camera: person.id_camara,
          x: pos.x,
          y: pos.y,
          time: pos.time
        };
      }
    });
  });
  
  selectedPoint.value = closestPoint;
};

// Watchers para actualizar el gráfico
watch([selectedId, selectedCamera], () => {
  stopAnimation();
  chartRef.value?.redraw();
});

onMounted(() => {
  // Inicialización si es necesaria
});

onBeforeUnmount(() => {
  stopAnimation();
});
</script>

<style scoped>
.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

select, button {
  transition: all 0.2s ease;
}

select:focus, button:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3B82F6;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>