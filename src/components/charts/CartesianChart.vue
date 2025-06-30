<template>
  <div class="cartesian-container">
    <canvas 
      ref="chartCanvas"
      :width="canvasWidth" 
      :height="canvasHeight"
      @mousemove="onMouseMove"
      @click="onClick"
      @wheel="onWheel"
    ></canvas>
    
    <!-- Controles de zoom y pan -->
    <div class="controls">
      <button @click="zoomIn" class="control-btn">+</button>
      <button @click="zoomOut" class="control-btn">-</button>
      <button @click="resetView" class="control-btn">⌂</button>
    </div>
    
    <!-- Información del cursor -->
    <div class="cursor-info" v-if="cursorPos">
      X: {{ cursorPos.x }}, Y: {{ cursorPos.y }}
    </div>
    
    <!-- Información de zoom -->
    <div class="zoom-info">
      Zoom: {{ Math.round(zoom * 100) }}%
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  canvasWidth: {
    type: Number,
    default: 1200
  },
  canvasHeight: {
    type: Number,
    default: 800
  },
  showGrid: {
    type: Boolean,
    default: true
  },
  showAxes: {
    type: Boolean,
    default: false
  },
  gridSize: {
    type: Number,
    default: 50
  }
});

const emit = defineEmits(['draw-content', 'point-click', 'canvas-ready']);

const chartCanvas = ref(null);
const zoom = ref(1);
const offset = ref({ x: 0, y: 0 });
const cursorPos = ref(null);
const isDragging = ref(false);
const lastMousePos = ref({ x: 0, y: 0 });

// Métodos de zoom y pan
const zoomIn = () => {
  zoom.value = Math.min(zoom.value * 1.2, 5);
  redraw();
};

const zoomOut = () => {
  zoom.value = Math.max(zoom.value / 1.2, 0.1);
  redraw();
};

const resetView = () => {
  zoom.value = 1;
  offset.value = { x: 0, y: 0 };
  redraw();
};

const onWheel = (event) => {
  event.preventDefault();
  const delta = event.deltaY > 0 ? 0.9 : 1.1;
  zoom.value = Math.max(0.1, Math.min(5, zoom.value * delta));
  redraw();
};

const onMouseMove = (event) => {
  const rect = chartCanvas.value.getBoundingClientRect();
  const canvasX = event.clientX - rect.left;
  const canvasY = event.clientY - rect.top;
  
  // Convertir coordenadas del canvas a coordenadas del mundo
  const worldX = Math.round((canvasX - offset.value.x) / zoom.value);
  const worldY = Math.round((canvasY - offset.value.y) / zoom.value);
  
  cursorPos.value = { x: worldX, y: worldY };
  
  // Manejar arrastre para pan
  if (isDragging.value) {
    const deltaX = canvasX - lastMousePos.value.x;
    const deltaY = canvasY - lastMousePos.value.y;
    
    offset.value.x += deltaX;
    offset.value.y += deltaY;
    
    lastMousePos.value = { x: canvasX, y: canvasY };
    redraw();
  }
};

const onClick = (event) => {
  const rect = chartCanvas.value.getBoundingClientRect();
  const canvasX = event.clientX - rect.left;
  const canvasY = event.clientY - rect.top;
  
  const worldX = (canvasX - offset.value.x) / zoom.value;
  const worldY = (canvasY - offset.value.y) / zoom.value;
  
  emit('point-click', { x: worldX, y: worldY });
};

// Eventos de mouse para pan
const onMouseDown = (event) => {
  isDragging.value = true;
  const rect = chartCanvas.value.getBoundingClientRect();
  lastMousePos.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
};

const onMouseUp = () => {
  isDragging.value = false;
};

// Función principal de dibujo
const redraw = () => {
  if (!chartCanvas.value) return;
  
  const ctx = chartCanvas.value.getContext('2d');
  ctx.clearRect(0, 0, props.canvasWidth, props.canvasHeight);
  
  // Aplicar transformaciones
  ctx.save();
  ctx.translate(offset.value.x, offset.value.y);
  ctx.scale(zoom.value, zoom.value);
  
  // Dibujar grid si está habilitado
  if (props.showGrid) {
    drawGrid(ctx);
  }
  
  // Dibujar ejes si está habilitado
  if (props.showAxes) {
    drawAxes(ctx);
  }
  
  // Emitir evento para que el componente padre dibuje su contenido
  emit('draw-content', ctx);
  
  ctx.restore();
};

const drawGrid = (ctx) => {
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1 / zoom.value; // Mantener grosor constante
  
  const gridSize = props.gridSize;
  const startX = Math.floor(-offset.value.x / zoom.value / gridSize) * gridSize;
  const endX = Math.ceil((props.canvasWidth - offset.value.x) / zoom.value / gridSize) * gridSize;
  const startY = Math.floor(-offset.value.y / zoom.value / gridSize) * gridSize;
  const endY = Math.ceil((props.canvasHeight - offset.value.y) / zoom.value / gridSize) * gridSize;
  
  // Líneas verticales
  for (let x = startX; x <= endX; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
    ctx.stroke();
  }
  
  // Líneas horizontales
  for (let y = startY; y <= endY; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
  }
};

const drawAxes = (ctx) => {
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2 / zoom.value;
  
  // Eje X (horizontal)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(props.canvasWidth / zoom.value, 0);
  ctx.stroke();
  
  // Eje Y (vertical)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, props.canvasHeight / zoom.value);
  ctx.stroke();
  
  // Configuración de texto
  ctx.fillStyle = '#333';
  ctx.font = `${12 / zoom.value}px Arial`;
  
  // Marcas y números en eje X
  ctx.textAlign = 'center';
  for (let x = 0; x <= props.canvasWidth / zoom.value; x += 100) {
    // Marca en el eje
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1 / zoom.value;
    ctx.beginPath();
    ctx.moveTo(x, -5 / zoom.value);
    ctx.lineTo(x, 5 / zoom.value);
    ctx.stroke();
    
    // Número
    if (x > 0) {
      ctx.fillText(x.toString(), x, -15 / zoom.value);
    }
  }
  
  // Marcas y números en eje Y
  ctx.textAlign = 'right';
  for (let y = 0; y <= props.canvasHeight / zoom.value; y += 100) {
    // Marca en el eje
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1 / zoom.value;
    ctx.beginPath();
    ctx.moveTo(-5 / zoom.value, y);
    ctx.lineTo(5 / zoom.value, y);
    ctx.stroke();
    
    // Número
    if (y > 0) {
      ctx.fillText(y.toString(), -15 / zoom.value, y + 4 / zoom.value);
    }
  }
  
  // Etiquetas de los ejes
  ctx.fillStyle = '#666';
  ctx.font = `bold ${14 / zoom.value}px Arial`;
  
  // Etiqueta del eje X
  ctx.textAlign = 'center';
  ctx.fillText('X', (props.canvasWidth / zoom.value) / 2, -30 / zoom.value);
  
  // Etiqueta del eje Y (rotada)
  ctx.save();
  ctx.translate(-35 / zoom.value, (props.canvasHeight / zoom.value) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('Y', 0, 0);
  ctx.restore();
  
  // Marcador del origen (0,0)
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.arc(0, 0, 4 / zoom.value, 0, 2 * Math.PI);
  ctx.fill();
  
  // Etiqueta del origen
  ctx.fillStyle = '#333';
  ctx.font = `${10 / zoom.value}px Arial`;
  ctx.textAlign = 'left';
  ctx.fillText('(0,0)', 8 / zoom.value, -8 / zoom.value);
};

onMounted(() => {
  chartCanvas.value.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);
  
  // Dibujo inicial
  redraw();
  emit('canvas-ready');
});

onBeforeUnmount(() => {
  if (chartCanvas.value) {
    chartCanvas.value.removeEventListener('mousedown', onMouseDown);
  }
  document.removeEventListener('mouseup', onMouseUp);
});

// Exponer métodos para componentes padre
defineExpose({ 
  redraw, 
  zoom: () => zoom.value, 
  setZoom: (newZoom) => { 
    zoom.value = newZoom; 
    redraw(); 
  },
  getOffset: () => offset.value,
  setOffset: (newOffset) => {
    offset.value = newOffset;
    redraw();
  }
});
</script>

<style scoped>
.cartesian-container {
  position: relative;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: #fafafa;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

canvas {
  cursor: grab;
  display: block;
  background: white;
}

canvas:active {
  cursor: grabbing;
}

.controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  z-index: 10;
}

.control-btn {
  width: 35px;
  height: 35px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.cursor-info {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
}

.zoom-info {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
}
</style>
