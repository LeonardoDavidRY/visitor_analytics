import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import Dashboard from '../views/Dashboard.vue';
import TimelineView from '../views/TimelineView.vue';
import HeatmapView from '../views/HeatmapView.vue';
import CameraMonitorView from '@/views/CameraMonitorView.vue';
import AgeBarView from '@/views/AgeBarView.vue';
import TypePieChart from '@/components/charts/TypePieChart.vue';
// Componentes antiguos (GPS/Leaflet) - mantenidos para compatibilidad
import LibraryMap from '@/components/charts/LibraryMap.vue';
import PersonRoutesView from '@/views/PersonRoutesView.vue';
// Nuevos componentes cartesianos
import CartesianRoutesView from '@/views/CartesianRoutesView.vue';
import CartesianHeatmapView from '@/views/CartesianHeatmapView.vue';


const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
  },
  {
    path: '/timeline',
    name: 'timeline',
    component: TimelineView,
  },
  {
    path: '/agebar',
    name: 'agebar',
    component: AgeBarView,
  },
  {
    path: '/typepie',
    name: 'typepie',
    component: TypePieChart,
  },
  // Componentes antiguos (GPS/Leaflet) - deshabilitados del menú principal
  // {
  //   path: '/librarymap',
  //   name: 'librarymap',
  //   component: LibraryMap,
  // },
  {
    path: '/heatmap',
    name: 'heatmap',
    component: HeatmapView,
  },
  // {
  //   path: '/personroutes',
  //   name: 'personroutes',
  //   component: PersonRoutesView,
  // },
  // Nuevos componentes cartesianos
  {
    path: '/cartesian-routes',
    name: 'cartesian-routes',
    component: CartesianRoutesView,
  },
  {
    path: '/cartesian-heatmap',
    name: 'cartesian-heatmap',
    component: CartesianHeatmapView,
  },
  {
    path: '/cameramonitor',
    name: 'cameramonitor',
    component: CameraMonitorView,
  },
 
  // Rutas legacy (accesibles directamente pero no en menú)
  {
    path: '/legacy/librarymap',
    name: 'legacy-librarymap',
    component: LibraryMap,
  },
  {
    path: '/legacy/personroutes',
    name: 'legacy-personroutes',
    component: PersonRoutesView,
  },
  {
    path: '/legacy/heatmap',
    name: 'legacy-heatmap',
    component: HeatmapView,
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;