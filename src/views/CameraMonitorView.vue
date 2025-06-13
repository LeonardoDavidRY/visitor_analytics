<template>
  <div class="multi-camera-monitor">
    <h1>Monitoreo de Cámaras Locales</h1>

    <!-- Mensajes de estado -->
    <div v-if="!isSupported" class="info-message error">
      La API MediaDevices (acceso a cámaras) no es compatible con este
      navegador.
    </div>
    <div v-else-if="isLoading" class="info-message">
      Buscando cámaras y solicitando permisos... Puede que necesites autorizar
      el acceso en tu navegador.
    </div>
    <!-- Este mensaje de error global SÍ pertenece a este componente -->
    <div v-else-if="globalError" class="info-message error">
      Error global al acceder a las cámaras: {{ globalError.message }}
      <button @click="setupCameras" class="retry-button">
        Intentar de nuevo
      </button>
    </div>
    <!-- Este mensaje se muestra si no hay cámaras y no hay errores globales y no está cargando -->
    <div
      v-else-if="
        monitoredCameras.length === 0 &&
        !isLoading &&
        isSupported &&
        !globalError
      "
      class="info-message"
    >
      No se encontraron cámaras de video conectadas o el acceso fue denegado.
      <button @click="setupCameras" class="retry-button">
        Intentar de nuevo
      </button>
    </div>

    <!-- Grid para mostrar los feeds de las cámaras -->
    <div class="video-grid">
      <!-- Renderiza el componente CameraFeed para cada cámara -->
      <!-- Usamos .filter(c => c.initialized) para solo mostrar cámaras que hemos procesado -->
      <div
        v-for="camera in monitoredCameras.filter((c) => c.initialized)"
        :key="camera.deviceId"
        class="video-grid-item"
      >
        <!-- Pasamos el objeto cámara y, opcionalmente, un tamaño inicial guardado -->
        <CameraFeedOptions
          :camera="camera"
          :initial-size="camera.size || { width: 320, height: 240 }"
          @resized="handleCameraResized"
          ref="cameraFeeds"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CameraFeedOptions from '../components/CameraFeedOptions.vue'; // Asegúrate de que la ruta sea correcta

export default {
  name: 'MultiCameraMonitorOptions',
  components: {
    CameraFeedOptions,
  },
  data() {
    return {
      monitoredCameras: [],
      isLoading: true,
      isSupported: !!navigator.mediaDevices,
      globalError: null, // Este estado SÍ pertenece a este componente
    };
  },
  methods: {
    async setupCameras() {
      if (!this.isSupported) {
        this.isLoading = false;
        return;
      }

      this.isLoading = true;
      this.globalError = null;

      // Detener y limpiar streams existentes
      this.monitoredCameras.forEach((camera) => {
        if (camera.stream) {
          camera.stream.getTracks().forEach((track) => track.stop());
          console.log(`Stream detenido en limpieza para: ${camera.name}`);
        }
      });
      this.monitoredCameras = []; // Reiniciar la lista

      try {
        // 1. Intentar obtener stream temporal para solicitar permisos y obtener labels
        let tempStream = null;
        try {
          tempStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          // Cerrar el stream temporal inmediatamente
          tempStream.getTracks().forEach((track) => track.stop());
          console.log('Permiso inicial de cámara concedido (o ya existía).');
        } catch (permError) {
          console.warn(
            'Permiso de cámara negado o error inicial de acceso:',
            permError
          );
          // Si el permiso es negado aquí, enumerateDevices podría dar nombres vacíos
          if (
            permError.name === 'NotAllowedError' ||
            permError.name === 'PermissionDeniedError'
          ) {
            this.globalError = new Error(
              'Acceso a la cámara denegado. Por favor, permite el acceso en la configuración del navegador.'
            );
          } else {
            // Capturar otros errores iniciales
            this.globalError = new Error(
              `Error inicial al acceder a la cámara: ${permError.message}`
            );
          }
          // Si hay un error global por permisos, no tiene sentido seguir intentando getUserMedia individuales
          if (
            this.globalError &&
            (this.globalError.name === 'NotAllowedError' ||
              (this.globalError.Error &&
                this.globalError.Error.name === 'NotAllowedError'))
          ) {
            this.isLoading = false;
            return;
          }
        }

        // 2. Listar todos los dispositivos multimedia
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log('Dispositivos encontrados:', devices);

        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput'
        );

        if (videoDevices.length === 0) {
          console.warn('No se encontraron dispositivos de entrada de video.');
          // Si ya había un error global de permisos, mantenemos ese
          if (!this.globalError) {
            this.globalError = new Error('No se encontraron cámaras de video.');
          }
          this.isLoading = false;
          return;
        }

        // Preparar la lista inicial de cámaras (sin stream aún)
        this.monitoredCameras = videoDevices.map((device) => {
          const savedSize = this.getSavedSize(device.deviceId);
          return {
            deviceId: device.deviceId,
            name: device.label || `Cámara ${device.deviceId.substring(0, 8)}`,
            stream: null,
            error: null,
            initialized: false, // Bandera para saber cuándo está lista para mostrarse
            size: savedSize, // Tamaño cargado
          };
        });

        // Si hay un error global (no de permisos), aún podemos intentar las cámaras individuales
        const currentGlobalError = this.globalError;
        this.globalError = null; // Limpiamos el global error para que los errores individuales lo puedan reemplazar si son peores

        // Para cada cámara, intentar obtener su stream secuencialmente
        for (const camera of this.monitoredCameras) {
          // Indicar al feed que está en proceso de carga
          // Necesitamos encontrar la instancia del componente hijo
          const feedComponent = this.$refs.cameraFeeds
            ? this.$refs.cameraFeeds.find(
                (feed) => feed.camera.deviceId === camera.deviceId
              )
            : null;
          if (feedComponent && feedComponent.startLoading) {
            feedComponent.startLoading();
          }

          try {
            console.log(`Intentando obtener stream para: ${camera.name}`);
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: camera.deviceId },
              },
              audio: false,
            });
            camera.stream = stream;
            camera.initialized = true; // Marcar como inicializada con éxito
            console.log(`Stream obtenido con éxito para: ${camera.name}`);
          } catch (err) {
            console.error(`Error al obtener stream para ${camera.name}:`, err);
            camera.error = err; // Guardar el error específico de esta cámara
            camera.initialized = true; // Marcar como inicializada (con error)

            // Si este error es de permiso denegado, sobrescribe cualquier error global anterior no de permisos
            if (
              err.name === 'NotAllowedError' ||
              err.name === 'PermissionDeniedError'
            ) {
              this.globalError = new Error(
                'Acceso a la cámara denegado. Por favor, permite el acceso en la configuración del navegador.'
              );
            } else if (
              err.name === 'NotFoundError' ||
              err.name === 'DevicesNotFoundError'
            ) {
              camera.error = new Error(
                'Dispositivo no encontrado o desconectado.'
              );
            } else if (err.name === 'OverconstrainedError') {
              camera.error = new Error(
                `Constraints de video no soportados: ${err.message}`
              );
            } else {
              camera.error = new Error(
                `Error al obtener stream: ${err.message}`
              );
            }
          }
        }
        // Si había un error global no de permisos antes de los intentos individuales, y no hubo un error de permisos individual, restaurarlo
        if (currentGlobalError && !this.globalError) {
          this.globalError = currentGlobalError;
        }
      } catch (err) {
        console.error('Error catastrófico en setupCameras:', err);
        // Solo sobrescribe si no hay un error global más específico (como permiso denegado)
        if (!this.globalError) {
          this.globalError = new Error(`Error crítico: ${err.message}`);
        }
      } finally {
        this.isLoading = false;
      }
    },

    handleCameraResized({ deviceId, width, height }) {
      const camera = this.monitoredCameras.find((c) => c.deviceId === deviceId);
      if (camera) {
        camera.size = { width, height };
        console.log(
          `Tamaño guardado en estado para ${camera.name}: W=${width}, H=${height}`
        );
        this.saveSize(deviceId, width, height);
      }
    },

    saveSize(deviceId, width, height) {
      if (localStorage) {
        try {
          const sizes = JSON.parse(localStorage.getItem('cameraSizes') || '{}');
          sizes[deviceId] = { width, height };
          localStorage.setItem('cameraSizes', JSON.stringify(sizes));
          console.log(`Tamaño guardado en localStorage para ${deviceId}`);
        } catch (e) {
          console.error('Error al guardar tamaño en localStorage:', e);
        }
      }
    },
    getSavedSize(deviceId) {
      if (localStorage) {
        try {
          const sizes = JSON.parse(localStorage.getItem('cameraSizes') || '{}');
          return sizes[deviceId] || null;
        } catch (e) {
          console.error('Error al leer tamaño de localStorage:', e);
          return null;
        }
      }
      return null;
    },
  },
  mounted() {
    this.setupCameras();
    // Considera añadir un listener para 'devicechange' si necesitas reaccionar
    // a la conexión/desconexión de cámaras sin recargar la página.
    // navigator.mediaDevices.addEventListener('devicechange', this.setupCameras); // Puede requerir lógica más robusta
  },
  // CAMBIADO: beforeDestroy a beforeUnmount para Vue 3
  beforeUnmount() {
    // Detener todos los streams al destruir el componente principal
    this.monitoredCameras.forEach((camera) => {
      if (camera.stream) {
        camera.stream.getTracks().forEach((track) => track.stop());
        console.log(
          `Stream detenido en beforeUnmount del monitor para: ${camera.name}`
        );
      }
    });
    this.monitoredCameras = []; // Limpiar la lista en el estado de Vue
    // if (navigator.mediaDevices.removeEventListener) { // Solo si añadiste el listener
    //    navigator.mediaDevices.removeEventListener('devicechange', this.setupCameras);
    // }
  },
};
</script>

<style scoped>
/* Estilos idénticos al anterior */
.multi-camera-monitor {
  padding: 20px;
  font-family: sans-serif;
  text-align: center;
}

h1 {
  color: #333;
}

.info-message {
  padding: 10px;
  margin: 10px auto;
  max-width: 600px;
  border-radius: 4px;
  background-color: #e9e9e9;
  color: #333;
  text-align: left;
  border: 1px solid #ccc;
}

.info-message.error {
  background-color: #fdd;
  color: #d00;
  border: 1px solid #d00;
}

.retry-button {
  margin-left: 10px;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 0.9em;
}

.retry-button:hover {
  background-color: #0056b3;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.video-grid-item {
  position: relative;
  width: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

/* Puedes añadir ::v-deep si necesitas estilos que afecten dentro del componente hijo */
/* .video-grid-item ::v-deep .camera-feed-resizable {
    // Estilos adicionales si son necesarios
} */
</style>
