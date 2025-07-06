import { createRouter, createWebHistory } from 'vue-router';
import TypePieChart from '@/components/charts/TypePieChart.vue';
import ApiDashboard from '@/views/ApiDashboard.vue';



const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../components/HelloWorld.vue'),
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/SystemStatus.vue'),
  },
  {
    path: '/typepie',
    name: 'typepie',
    component: TypePieChart,
  },
  {
    path: '/simple-type',
    name: 'simple-type',
    component: () => import('../components/charts/SimpleTypeChart.vue'),
  },
  {
    path: '/simple-age',
    name: 'simple-age',
    component: () => import('../components/charts/SimpleAgeChart.vue'),
  },
  {
    path: '/simple-gender',
    name: 'simple-gender',
    component: () => import('../components/charts/SimpleGenderChart.vue'),
  },
  {
    path: '/simple-hour',
    name: 'simple-hour',
    component: () => import('../components/charts/SimpleHourChart.vue'),
  },
  {
    path: '/api-dashboard',
    name: 'api-dashboard',
    component: ApiDashboard,
  },
  {
    path: '/detecciones',
    name: 'detecciones',
    component: () => import('../views/DeteccionesDashboard.vue'),
  },
  {
    path: '/detecciones-timeline',
    name: 'detecciones-timeline',
    component: () => import('../views/DeteccionesTimelineView.vue'),
  },
  {
    path: '/detecciones-heatmap',
    name: 'detecciones-heatmap', 
    component: () => import('../views/DeteccionesHeatmapView.vue'),
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