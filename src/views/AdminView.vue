<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        Panel de Administración
      </h1>

      <!-- Control de fuente de datos -->
      <DataSourceControl />

      <!-- Información de la API -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Información de la API</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-medium text-gray-700 mb-2">Estructura de Datos Esperada:</h3>
            <pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto">{{
              JSON.stringify({
                "conteo_edad": {
                  "18 -25": 7,
                  "25 - 32": 4,
                  "32 o mas": 1
                },
                "conteo_hora": {
                  "12": 4,
                  "22": 4,
                  "7": 3,
                  "8": 1
                },
                "conteo_sexo": {
                  "Femenino": 6,
                  "Masculino": 6
                },
                "conteo_tipo": {
                  "Administrativo": 1,
                  "Docente": 3,
                  "Estudiante": 5,
                  "Externo": 3
                }
              }, null, 2)
            }}</pre>
          </div>
          
          <div>
            <h3 class="font-medium text-gray-700 mb-2">Configuración:</h3>
            <div class="space-y-2 text-sm">
              <p><strong>URL de API:</strong> {{ apiUrl }}</p>
              <p><strong>Método:</strong> GET</p>
              <p><strong>Timeout de Cache:</strong> 5 minutos</p>
              <p><strong>Fallback:</strong> Datos locales automático</p>
            </div>
            
            <h3 class="font-medium text-gray-700 mt-4 mb-2">Componentes Afectados:</h3>
            <ul class="text-sm space-y-1">
              <li>• Gráfico de Edades (AgeBarChart)</li>
              <li>• Gráfico de Tipos (TypePieChart)</li>
              <li>• Timeline de Visitantes (TimelineChart)</li>
              <li>• Contador de Personas (PersonCountChart)</li>
            </ul>

            <h3 class="font-medium text-gray-700 mt-4 mb-2">Componentes que siguen usando datos locales:</h3>
            <ul class="text-sm space-y-1">
              <li>• Mapas de Calor (HeatmapChart)</li>
              <li>• Rutas de Personas (PersonRoutes)</li>
              <li>• Mapa de la Biblioteca (LibraryMap)</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Prueba de gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Vista Previa - Gráfico de Edades</h3>
          <AgeBarChart />
        </div>
        
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Vista Previa - Gráfico de Tipos</h3>
          <TypePieChart />
        </div>
      </div>

      <div class="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold mb-4">Vista Previa - Timeline</h3>
        <TimelineChart />
      </div>
    </div>
  </div>
</template>

<script>
import DataSourceControl from '@/components/DataSourceControl.vue';
import AgeBarChart from '@/components/charts/AgeBarChart.vue';
import TypePieChart from '@/components/charts/TypePieChart.vue';
import TimelineChart from '@/components/charts/TimelineChart.vue';

export default {
  name: 'AdminView',
  components: {
    DataSourceControl,
    AgeBarChart,
    TypePieChart,
    TimelineChart
  },
  data() {
    return {
      apiUrl: 'https://5ea4-186-69-112-160.ngrok-free.app/api/datos'
    };
  },
  mounted() {
    // Escuchar cambios en la fuente de datos para actualizar las vistas
    window.addEventListener('dataSourceChanged', this.refreshCharts);
  },
  beforeUnmount() {
    window.removeEventListener('dataSourceChanged', this.refreshCharts);
  },
  methods: {
    refreshCharts() {
      // Forzar la recarga de los componentes
      this.$forceUpdate();
    }
  }
};
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
