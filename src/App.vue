<template>
  <div
    id="app"
    class="h-screen min-h-screen bg-gradient-to-br from-gray-100 via-white to-green-100 flex"
  >
    <!-- Sidebar -->
    <aside
      class="w-64 h-screen bg-white/90 shadow-lg flex flex-col items-center py-8 px-4 sticky top-0 left-0 z-50"
    >
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
      <nav class="flex flex-col w-full space-y-2">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="px-4 py-2 rounded-lg font-semibold text-gray-700 hover:bg-green-100 hover:text-green-700 transition group"
          active-class="bg-green-100 text-green-700"
          exact-active-class="bg-green-100 text-green-700"
        >
          {{ link.label }}
        </router-link>
      </nav>
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
const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/api-dashboard', label: 'Dashboard API' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/agebar', label: 'Personas por Edad' },
  { to: '/typepie', label: 'Tipo de persona' },
  { to: '/cartesian-heatmap', label: 'Mapa de Calor' },
  { to: '/cartesian-routes', label: 'Rutas de Visitantes' },
  { to: '/cameramonitor', label: 'Cámara Monitor' },
];
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