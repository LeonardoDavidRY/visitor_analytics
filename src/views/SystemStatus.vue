<template>
  <div class="space-y-6">
    <!-- Componente de presentación del proyecto -->
    <div class="mb-8">
      <HelloWorld msg="Proyecto de Análisis de Visitantes" />
    </div>

    <!-- Header -->
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">🏛️ Visitor Analytics</h1>
      <p class="text-xl text-gray-600">Sistema de Análisis de Visitantes</p>
    </div>

    <!-- Estado general del sistema -->
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Estado del Sistema</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Estado API Principal -->
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-blue-900">API Principal</h3>
            <div class="flex items-center space-x-2">
              <div 
                :class="[
                  'w-3 h-3 rounded-full',
                  apiStatus.main ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></div>
              <span class="text-sm font-medium">
                {{ apiStatus.main ? 'Online' : 'Offline' }}
              </span>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-blue-700">Endpoint:</span>
              <span class="text-sm text-blue-900 font-mono">{{ mainApiUrl }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-blue-700">Última verificación:</span>
              <span class="text-sm text-blue-900">{{ lastMainCheck || 'No verificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-blue-700">Datos disponibles:</span>
              <span class="text-sm text-blue-900">{{ mainDataCount }} campos</span>
            </div>
          </div>
          
          <button 
            @click="testMainApi"
            :disabled="testing"
            class="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ testing ? 'Probando...' : 'Probar Conexión' }}
          </button>
        </div>

        <!-- Estado API Detecciones -->
        <div class="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-purple-900">API Detecciones</h3>
            <div class="flex items-center space-x-2">
              <div 
                :class="[
                  'w-3 h-3 rounded-full',
                  apiStatus.detecciones ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></div>
              <span class="text-sm font-medium">
                {{ apiStatus.detecciones ? 'Online' : 'Offline' }}
              </span>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-purple-700">Endpoint:</span>
              <span class="text-sm text-purple-900 font-mono">{{ deteccionesApiUrl }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-purple-700">Última verificación:</span>
              <span class="text-sm text-purple-900">{{ lastDeteccionesCheck || 'No verificado' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-purple-700">Timestamps disponibles:</span>
              <span class="text-sm text-purple-900">{{ deteccionesCount }}</span>
            </div>
          </div>
          
          <button 
            @click="testDeteccionesApi"
            :disabled="testing"
            class="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {{ testing ? 'Probando...' : 'Probar Conexión' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Dashboards disponibles -->
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Dashboards Disponibles</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Dashboard API Principal -->
        <router-link 
          to="/api-dashboard"
          class="block bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold">📊 Dashboard API</h3>
            <div 
              :class="[
                'w-3 h-3 rounded-full',
                apiStatus.main ? 'bg-green-300' : 'bg-red-300'
              ]"
            ></div>
          </div>
          <p class="text-blue-100 text-sm">Análisis completo de visitantes con datos estadísticos</p>
        </router-link>

        <!-- Dashboard Detecciones -->
        <router-link 
          to="/detecciones"
          class="block bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4 hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold">🎯 Detecciones</h3>
            <div 
              :class="[
                'w-3 h-3 rounded-full',
                apiStatus.detecciones ? 'bg-green-300' : 'bg-red-300'
              ]"
            ></div>
          </div>
          <p class="text-purple-100 text-sm">Timeline y mapas de calor en tiempo real</p>
        </router-link>

        <!-- Dashboard Principal -->
        <router-link 
          to="/dashboard"
          class="block bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4 hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold">📈 Dashboard</h3>
            <div class="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>
          <p class="text-green-100 text-sm">Vista general con datos estáticos</p>
        </router-link>
      </div>
    </div>

    <!-- Gráficas individuales -->
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Gráficas Individuales</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <router-link 
          to="/timeline"
          class="block bg-orange-100 hover:bg-orange-200 rounded-lg p-4 transition-colors"
        >
          <h3 class="font-semibold text-orange-800">📅 Timeline</h3>
          <p class="text-orange-600 text-sm mt-1">Actividad por tiempo</p>
        </router-link>

        <router-link 
          to="/agebar"
          class="block bg-blue-100 hover:bg-blue-200 rounded-lg p-4 transition-colors"
        >
          <h3 class="font-semibold text-blue-800">👥 Por Edad</h3>
          <p class="text-blue-600 text-sm mt-1">Distribución etaria</p>
        </router-link>

        <router-link 
          to="/typepie"
          class="block bg-green-100 hover:bg-green-200 rounded-lg p-4 transition-colors"
        >
          <h3 class="font-semibold text-green-800">🏛️ Por Tipo</h3>
          <p class="text-green-600 text-sm mt-1">Tipos de persona</p>
        </router-link>

        <router-link 
          to="/cartesian-heatmap"
          class="block bg-purple-100 hover:bg-purple-200 rounded-lg p-4 transition-colors"
        >
          <h3 class="font-semibold text-purple-800">🗺️ Mapa Calor</h3>
          <p class="text-purple-600 text-sm mt-1">Distribución espacial</p>
        </router-link>
      </div>
    </div>

    <!-- Últimos resultados de pruebas -->
    <div v-if="testResults.length > 0" class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Últimas Pruebas</h2>
      
      <div class="space-y-3">
        <div 
          v-for="result in testResults.slice(0, 3)" 
          :key="result.id"
          :class="[
            'p-3 rounded-lg border-l-4',
            result.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
          ]"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium">{{ result.api }}</span>
            <span class="text-sm text-gray-500">{{ result.timestamp }}</span>
          </div>
          <p class="text-sm mt-1" :class="result.success ? 'text-green-700' : 'text-red-700'">
            {{ result.message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiService from '@/services/apiService.js';
import deteccionesService from '@/services/deteccionesService.js';
import HelloWorld from '@/components/HelloWorld.vue';

// Estado reactivo
const apiStatus = ref({
  main: false,
  detecciones: false
});

const testing = ref(false);
const lastMainCheck = ref('');
const lastDeteccionesCheck = ref('');
const mainDataCount = ref(0);
const deteccionesCount = ref(0);
const testResults = ref([]);

// URLs para mostrar
const mainApiUrl = ref('ngrok/api/datos');
const deteccionesApiUrl = ref('localhost:8080/api/detecciones');

// Métodos
const testMainApi = async () => {
  testing.value = true;
  
  try {
    const data = await apiService.fetchData();
    
    if (data && (data.conteo_edad || data.conteo_hora)) {
      apiStatus.value.main = true;
      mainDataCount.value = Object.keys(data).length;
      lastMainCheck.value = new Date().toLocaleTimeString('es-ES');
      
      addTestResult('API Principal', true, `Conectado - ${mainDataCount.value} campos disponibles`);
    } else {
      apiStatus.value.main = false;
      addTestResult('API Principal', false, 'Sin datos válidos');
    }
  } catch (error) {
    apiStatus.value.main = false;
    addTestResult('API Principal', false, error.message);
  } finally {
    testing.value = false;
  }
};

const testDeteccionesApi = async () => {
  testing.value = true;
  
  try {
    const data = await deteccionesService.fetchTimestamps();
    
    if (data && data.success) {
      apiStatus.value.detecciones = true;
      deteccionesCount.value = data.total || 0;
      lastDeteccionesCheck.value = new Date().toLocaleTimeString('es-ES');
      
      addTestResult('API Detecciones', true, `Conectado - ${deteccionesCount.value} timestamps disponibles`);
    } else {
      apiStatus.value.detecciones = false;
      addTestResult('API Detecciones', false, 'Sin datos válidos');
    }
  } catch (error) {
    apiStatus.value.detecciones = false;
    addTestResult('API Detecciones', false, error.message);
  } finally {
    testing.value = false;
  }
};

const addTestResult = (api, success, message) => {
  testResults.value.unshift({
    id: Date.now(),
    api,
    success,
    message,
    timestamp: new Date().toLocaleTimeString('es-ES')
  });
  
  // Mantener solo los últimos 10 resultados
  if (testResults.value.length > 10) {
    testResults.value = testResults.value.slice(0, 10);
  }
};

// Verificar estado al montar
onMounted(() => {
  testMainApi();
  testDeteccionesApi();
});
</script>
