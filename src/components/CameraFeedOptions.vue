<template>
  <!-- Usamos vue-resizable como contenedor -->
  <vue-resizable
    :width="currentWidth"
    :height="currentHeight"
    :active="['r', 'rb', 'b']"
    class="camera-feed-resizable"
    @resize="handleResize"
    @mouseup="saveSize"     
    @touchend="saveSize"  
  >
    <div class="camera-feed-content">
      <!-- Título o nombre de la cámara -->
      <div class="camera-name">{{ camera.name || `Cámara ${camera.deviceId}` }}</div>

      <!-- Elemento de video -->
      <video
        ref="videoRef"
        autoplay
        playsinline
        muted
        class="camera-video"
        @loadedmetadata="onVideoLoaded"
      ></video>
      <!-- Mensaje de estado o error -->
      <!-- Solo mostramos 'Esperando stream...' si no hay stream, no hay error y no estamos ya cargando -->
      <div v-if="!camera.stream && !camera.error && !isLoading" class="status-message">
         Esperando stream...
      </div>
       <!-- Mostramos 'Cargando stream...' si la bandera isLoading es true -->
       <div v-if="isLoading" class="status-message">Cargando stream...</div>

      <!-- Mensaje de error si falla la carga o permisos -->
      <div v-if="camera.error" class="error-message">{{ camera.error.message || 'Error desconocido' }}</div>
    </div>
  </vue-resizable>
</template>

<script>
import VueResizable from 'vue-resizable'; // Importa la librería

export default {
  name: 'CameraFeedOptions',
  components: {
    VueResizable
  },
  props: {
    camera: {
      type: Object,
      required: true
    },
    initialSize: {
        type: Object,
        default: () => ({ width: 320, height: 240 })
    }
  },
  data() {
    return {
      currentWidth: this.initialSize.width,
      currentHeight: this.initialSize.height,
      isLoading: false, // Estado para indicar si estamos activamente intentando obtener el stream
    };
  },
  watch: {
    // Observar cambios en el objeto camera, específicamente en el stream
    // REMOVIDO: oldStream del parámetro
    'camera.stream'(newStream) {
      const videoElement = this.$refs.videoRef;
      if (videoElement) {
        if (newStream) {
          console.log(`Asignando stream a videoRef para ${this.camera.name}`);
          videoElement.srcObject = newStream;
          // Intentar reproducir, capturando posibles errores de autoplay
          videoElement.play().catch(e => console.error(`Error reproduciendo stream para ${this.camera.name}:`, e));
          this.isLoading = false; // Ya no está cargando una vez que llega el stream
        } else {
          // Si el stream se vuelve null (ej. desconexión o limpieza)
          videoElement.srcObject = null;
           console.log(`Limpiando srcObject para ${this.camera.name}`);
          // No cambiamos isLoading aquí, el padre gestiona el estado de la cámara
        }
      }
    },
    // Watch para el error si quieres reaccionar a él
    'camera.error'(newError) {
        if (newError) {
            console.error(`Error específico en feed ${this.camera.name}:`, newError);
            this.isLoading = false; // Dejar de intentar si hay un error definitivo
        }
    }
  },
  methods: {
    onVideoLoaded() {
      const videoElement = this.$refs.videoRef;
      if (videoElement && videoElement.paused) {
         console.log(`Intentando reproducir video después de loadedmetadata para ${this.camera.name}`);
         videoElement.play().catch(e => console.error(`Error reproduciendo después de loadedmetadata para ${this.camera.name}:`, e));
      }
    },
    handleResize(newRect) {
      this.currentWidth = newRect.width;
      this.currentHeight = newRect.height;
    },
    saveSize() {
        console.log(`Tamaño final para ${this.camera.name}: W=${this.currentWidth}, H=${this.currentHeight}`);
        // Emitimos el evento al componente padre
        this.$emit('resized', {
            deviceId: this.camera.deviceId,
            width: this.currentWidth,
            height: this.currentHeight
        });
    },
     // Método llamado por el padre para indicar que se está intentando cargar
    startLoading() {
       this.isLoading = true;
    }
  },
  mounted() {
    // Al montar, si el stream ya existe (por ejemplo, si el padre lo obtuvo rápido), asignarlo
    if (this.camera.stream && this.$refs.videoRef) {
       console.log(`Montando y asignando stream inicial para ${this.camera.name}`);
       this.$refs.videoRef.srcObject = this.camera.stream;
       this.$refs.videoRef.play().catch(e => console.error(`Error reproduciendo stream inicial para ${this.camera.name}:`, e));
       this.isLoading = false; // Ya no está cargando
    } else if (!this.camera.error) {
        // Si no hay stream ni error al montar, asumimos que el padre intentará cargarlo
         this.startLoading();
    }
  },
  // CAMBIADO: beforeDestroy a beforeUnmount para Vue 3
  beforeUnmount() {
    // Limpieza (opcional aquí, gestionada principalmente por el padre)
    // console.log(`beforeUnmount de CameraFeedOptions para ${this.camera.name}`);
  }
};
</script>

<style scoped>
/* Estilos idénticos al anterior */
.camera-feed-resizable {
    border: 1px solid #ccc;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    background-color: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.camera-feed-resizable::v-deep .vdr-handle {
    background-color: rgba(0, 123, 255, 0.5);
    border-radius: 2px;
}

.camera-feed-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
}

.camera-name {
  position: absolute;
  top: 5px;
  left: 5px;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 2px 5px;
  font-size: 0.8em;
  z-index: 1;
}

.camera-video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-message,
.error-message {
  color: white;
  text-align: center;
  padding: 20px;
  z-index: 1;
}

.error-message {
  color: red;
}
</style>