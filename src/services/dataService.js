// src/services/dataService.js
import {
  visitorData,
  getDataByZone,
  getDataByHour,
  getOverallStats,
  getDataByTimeRange,
  getHeatmapData,
} from '@/data/mockData.js';

export default {
  // Obtener todos los datos
  getAllData() {
    return visitorData;
  },

  // Datos agregados por zona
  getZoneData() {
    return getDataByZone();
  },

  // Datos por hora
  getHourlyData() {
    return getDataByHour();
  },

  // Estadísticas generales
  getStats() {
    return getOverallStats();
  },

  // Filtrar por rango de tiempo
  filterByTime(startHour, endHour) {
    return getDataByTimeRange(startHour, endHour);
  },

  // Datos para mapa de calor
  getHeatmap() {
    return getHeatmapData();
  },
};
