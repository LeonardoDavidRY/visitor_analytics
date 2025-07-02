<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Minería de Datos
        </h1>
        <p class="text-2xl text-gray-600 font-medium">Noveno Semestre</p>
        <div class="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-6"></div>
      </div>

      <!-- Teams Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <!-- Equipo de Recolección de Datos -->
       <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div class="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-center h-32 flex flex-col justify-center">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white">Equipo de Recolección de Datos</h3>
          </div>
          <div class="p-6">
            <ul class="space-y-3">
              <li v-for="student in dataCollectionTeam" :key="student" 
                  class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-purple-600 font-semibold text-sm">{{ student.charAt(0) }}</span>
                </div>
                <span class="text-gray-700 font-medium">{{ student }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Equipo de Minería de Datos -->
        <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center h-32 flex flex-col justify-center">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white">Equipo de Minería de Datos</h3>
          </div>
          <div class="p-6">
            <ul class="space-y-3">
              <li v-for="student in dataMiningTeam" :key="student" 
                  class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-blue-600 font-semibold text-sm">{{ student.charAt(0) }}</span>
                </div>
                <span class="text-gray-700 font-medium">{{ student }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Equipo de Visualización de Datos -->
        <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div class="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-center h-32 flex flex-col justify-center">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white">Visualización de Datos</h3>
          </div>
          <div class="p-6">
            <ul class="space-y-3">
              <li v-for="student in dataVisualizationTeam" :key="student" 
                  class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-purple-600 font-semibold text-sm">{{ student.charAt(0) }}</span>
                </div>
                <span class="text-gray-700 font-medium">{{ student }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Highlights Section -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-800 mb-4">Características del Proyecto</h2>
          <p class="text-gray-600">Análisis avanzado de datos de visitantes con tecnologías modernas</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">Análisis en Tiempo Real</h3>
            <p class="text-sm text-gray-600">Monitoreo continuo de patrones de visitantes</p>
          </div>

          <div class="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">Dashboards Interactivos</h3>
            <p class="text-sm text-gray-600">Visualizaciones dinámicas y personalizables</p>
          </div>

          <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-purple-500 rounded-full mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">Machine Learning</h3>
            <p class="text-sm text-gray-600">Algoritmos predictivos y de clasificación</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String,
  },
  data() {
    return {
      dataCollectionTeam: [
        'Ana García López',
        'Carlos Mendoza',
        'María Fernández',
        'Luis Rodríguez'
      ],
      dataMiningTeam: [
        'Sofia Martínez',
        'Diego Herrera',
        'Valentina Torres',
        'Andrés Jiménez'
      ],
      dataVisualizationTeam: [
        'Camila Vargas',
        'Santiago Cruz',
        'Isabella Morales',
        'Felipe Castillo'
      ]
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
