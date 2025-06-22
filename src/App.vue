<template>
  <div id="app">
    <nav class="bg-white shadow-md p-4">
      <div class="flex justify-center space-x-6 text-lg">
        <router-link to="/dashboard" class="hover:text-green-600"
          >Dashboard</router-link
        >
        <router-link to="/timeline" class="hover:text-green-600"
          >Timeline</router-link
        >
        <router-link to="/agebar" class="hover:text-green-600"
          >Personas por Edad</router-link
        >
        
        <router-link to="/typepie" class="hover:text-green-600"
          >Tipo de persona</router-link
        >
        
        <router-link to="/heatmap" class="hover:text-green-600"
          >Heatmap</router-link
        >
        <router-link to="/personroutes" class="hover:text-green-600"
          >Rutas de los visitantes</router-link
        >
        <router-link to="/cameramonitor" class="hover:text-green-600"
          >Cámara Monitor</router-link
        >
      </div>
    </nav>

    <main class="p-6">
      <router-view />
    </main>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  background: #ffffff;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

nav a {
  margin: 0 15px;
  font-weight: bold;
  text-decoration: none;
  color: #2c3e50;
  transition: color 0.2s ease;
}

nav a:hover {
  color: #42b983;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
