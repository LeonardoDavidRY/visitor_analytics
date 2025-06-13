import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import Dashboard from '../views/Dashboard.vue';
import TimelineView from '../views/TimelineView.vue';
import HeatmapView from '../views/HeatmapView.vue';
import CameraMonitorView from '@/views/CameraMonitorView.vue';

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
    path: '/heatmap',
    name: 'heatmap',
    component: HeatmapView,
  },
  {
    path: '/cameramonitor',
    name: 'cameramonitor',
    component: CameraMonitorView,
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
