<template>
  <div
    id="app"
    class="h-screen min-h-screen bg-gradient-to-br from-gray-100 via-white to-green-100 flex"
  >
    <!-- Sidebar -->
    <aside
      class="w-72 h-screen bg-white/90 shadow-lg flex flex-col py-6 px-4 sticky top-0 left-0 z-50 overflow-y-auto"
    >
      <!-- Header -->
      <div class="flex flex-col items-center mb-6">
        <img
          src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
          alt="Logo"
          class="w-14 h-14 rounded-full shadow mb-2"
        />
        <span
          class="text-2xl font-extrabold text-green-600 tracking-tight text-center"
          >Visitor Analytics</span
        >
      </div>

      <!-- Estado de APIs -->
      <div class="mb-6 bg-gray-50 rounded-lg p-3">
        <h4 class="text-sm font-semibold text-gray-700 mb-2">Estado de APIs</h4>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-600">API Principal</span>
            <div class="flex items-center space-x-1">
              <div 
                :class="[
                  'w-2 h-2 rounded-full',
                  apiStatus.main ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></div>
              <span class="text-xs">{{ apiStatus.main ? 'Online' : 'Offline' }}</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-600">API Detecciones</span>
            <div class="flex items-center space-x-1">
              <div 
                :class="[
                  'w-2 h-2 rounded-full',
                  apiStatus.detecciones ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></div>
              <span class="text-xs">{{ apiStatus.detecciones ? 'Online' : 'Offline' }}</span>
            </div>
          </div>
        </div>
        <button 
          @click="checkApiStatus"
          :disabled="checkingStatus"
          class="w-full mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ checkingStatus ? 'Verificando...' : 'Verificar Estado' }}
        </button>
      </div>

      <!-- Navegación por categorías -->
      <nav class="flex flex-col w-full space-y-4">
        <!-- Dashboards principales -->
        <div>
          <h4 class="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">📊 Dashboards</h4>
          <div class="space-y-1">
            <router-link
              v-for="link in dashboardLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center justify-between px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-green-100 hover:text-green-700 transition group text-sm"
              active-class="bg-green-100 text-green-700"
              exact-active-class="bg-green-100 text-green-700"
            >
              <span>{{ link.label }}</span>
              <span v-if="link.api" class="text-xs">
                <div 
                  :class="[
                    'w-2 h-2 rounded-full inline-block',
                    getApiStatusColor(link.api)
                  ]"
                ></div>
              </span>
            </router-link>
          </div>
        </div>

        <!-- Gráficas individuales -->
        <div>
          <h4 class="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">📈 Gráficas</h4>
          <div class="space-y-1">
            <router-link
              v-for="link in chartLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center justify-between px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition group text-sm"
              active-class="bg-blue-100 text-blue-700"
              exact-active-class="bg-blue-100 text-blue-700"
            >
              <span>{{ link.label }}</span>
              <span v-if="link.api" class="text-xs">
                <div 
                  :class="[
                    'w-2 h-2 rounded-full inline-block',
                    getApiStatusColor(link.api)
                  ]"
                ></div>
              </span>
            </router-link>
          </div>
        </div>

        <!-- Detecciones y visualizaciones -->
        <div>
          <h4 class="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">🎯 Detecciones</h4>
          <div class="space-y-1">
            <router-link
              v-for="link in deteccionesLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center justify-between px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition group text-sm"
              active-class="bg-purple-100 text-purple-700"
              exact-active-class="bg-purple-100 text-purple-700"
            >
              <span>{{ link.label }}</span>
              <span v-if="link.api" class="text-xs">
                <div 
                  :class="[
                    'w-2 h-2 rounded-full inline-block',
                    getApiStatusColor(link.api)
                  ]"
                ></div>
              </span>
            </router-link>
          </div>
        </div>

        <!-- Monitoreo -->
        <div>
          <h4 class="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">📹 Monitoreo</h4>
          <div class="space-y-1">
            <router-link
              v-for="link in monitorLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center justify-between px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition group text-sm"
              active-class="bg-orange-100 text-orange-700"
              exact-active-class="bg-orange-100 text-orange-700"
            >
              <span>{{ link.label }}</span>
              <span v-if="link.api" class="text-xs">
                <div 
                  :class="[
                    'w-2 h-2 rounded-full inline-block',
                    getApiStatusColor(link.api)
                  ]"
                ></div>
              </span>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Información adicional -->
      <div class="mt-auto pt-4 border-t border-gray-200">
        <div class="text-xs text-gray-500 text-center">
          <p>Última verificación:</p>
          <p>{{ lastCheck || 'No verificado' }}</p>
        </div>
      </div>
    </aside>
    <!-- Main content -->
    <div class="flex-1 flex flex-col h-screen">
      <main
        class="flex-1 max-w-6xl mx-auto p-6 rounded-2xl bg-white/80 shadow-lg w-full overflow-auto"
      >
        <router-view />
      </main>
      <footer class="text-center text-gray-500 py-3 text-sm bg-transparent">
        © {{ new Date().getFullYear() }} Visitor Analytics · Hecho con
        <span class="text-green-500">♥</span> en Vue
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiService from '@/services/apiService.js';
import deteccionesService from '@/services/deteccionesService.js';

// Estado reactivo
const apiStatus = ref({
  main: false,
  detecciones: false
});
const checkingStatus = ref(false);
const lastCheck = ref('');

// Enlaces organizados por categorías
const dashboardLinks = [
  { to: '/', label: 'Inicio', api: null },
  { to: '/dashboard', label: 'Dashboard Principal', api: null },
  { to: '/api-dashboard', label: 'Dashboard API', api: 'main' },
  { to: '/detecciones', label: 'Dashboard Detecciones', api: 'detecciones' },
];

const chartLinks = [
  { to: '/timeline', label: 'Timeline Actividad', api: 'main' },
  { to: '/agebar', label: 'Distribución por Edad', api: 'main' },
  { to: '/typepie', label: 'Tipos de Persona', api: 'main' },
];

const deteccionesLinks = [
  { to: '/detecciones-timeline', label: 'Timeline de Detecciones', api: 'detecciones' },
  { to: '/detecciones-heatmap', label: 'Mapa de Calor - Coordenadas', api: 'detecciones' },
];

const monitorLinks = [
  { to: '/cameramonitor', label: 'Monitor de Cámara', api: null },
];

// Métodos
const checkApiStatus = async () => {
  checkingStatus.value = true;
  
  try {
    // Verificar API principal
    try {
      const mainData = await apiService.fetchData();
      apiStatus.value.main = !!(mainData && (mainData.conteo_edad || mainData.conteo_hora));
    } catch (error) {
      console.warn('API Principal no disponible:', error.message);
      apiStatus.value.main = false;
    }

    // Verificar API de detecciones  
    try {
      const deteccionesData = await deteccionesService.fetchTimestamps();
      apiStatus.value.detecciones = !!(deteccionesData && deteccionesData.success);
    } catch (error) {
      console.warn('API Detecciones no disponible:', error.message);
      apiStatus.value.detecciones = false;
    }

    lastCheck.value = new Date().toLocaleTimeString('es-ES');
  } catch (error) {
    console.error('Error verificando APIs:', error);
  } finally {
    checkingStatus.value = false;
  }
};

const getApiStatusColor = (apiType) => {
  if (!apiType) return 'bg-gray-400'; // Sin API
  
  switch (apiType) {
    case 'main':
      return apiStatus.value.main ? 'bg-green-500' : 'bg-red-500';
    case 'detecciones':
      return apiStatus.value.detecciones ? 'bg-green-500' : 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};

// Verificar estado al montar el componente
onMounted(() => {
  checkApiStatus();
  
  // Verificar cada 30 segundos
  setInterval(checkApiStatus, 30000);
});
</script>

<style>
body {
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  background: linear-gradient(135deg, #7dda99 0%, #e0f2fe 100%);
  color: #222;
}

/* Scrollbar moderno */
::-webkit-scrollbar {
  width: 10px;
  background: #55b1ef;
}
::-webkit-scrollbar-thumb {
  background: #86efac;
  border-radius: 8px;
}
::-webkit-scrollbar-thumb:hover {
  background: #4ade80;
}

/* Selección de texto */
::selection {
  background: #bbf7d0;
  color: #065f46;
}

/* Inputs y selects más suaves */
input,
select,
textarea {
  outline: none;
  transition: box-shadow 0.2s;
}
input:focus,
select:focus,
textarea:focus {
  box-shadow: 0 0 0 2px #4ade80;
  border-color: #4ade80;
}

/* Botones más atractivos (si usas botones nativos) */
button {
  transition: background 0.2s, color 0.2s;
}
button:hover {
  background: #4ade80;
  color: white;
}

/* Animación sutil para los links */
a,
.router-link-active,
.router-link-exact-active {
  transition: color 0.2s, border-bottom 0.2s;
}
</style>