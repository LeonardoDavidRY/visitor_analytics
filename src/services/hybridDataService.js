import apiDataService from './apiDataService.js';
import personas from '@/data/registro_personas_biblioteca.json';

class HybridDataService {
  constructor() {
    this.useAPI = true; // Flag para determinar si usar API o datos locales
  }

  // Método para alternar entre API y datos locales
  setDataSource(useAPI) {
    this.useAPI = useAPI;
  }

  // Método unificado para obtener datos de edad
  async getAgeData() {
    if (this.useAPI) {
      try {
        return await apiDataService.getAgeData();
      } catch (error) {
        console.warn('API no disponible, usando datos locales:', error);
        return this.getLocalAgeData();
      }
    } else {
      return this.getLocalAgeData();
    }
  }

  // Método local para datos de edad (fallback)
  getLocalAgeData() {
    const ageMap = {};
    personas.forEach((p) => {
      if (typeof p.edad === 'number' && p.id) {
        if (!ageMap[p.edad]) ageMap[p.edad] = new Set();
        ageMap[p.edad].add(p.id);
      }
    });
    return Object.entries(ageMap)
      .sort((a, b) => a[0] - b[0])
      .map(([edad, idSet]) => ({ edad, total: idSet.size }));
  }

  // Método unificado para obtener datos de tipo
  async getTypeData(genderFilter = '') {
    if (this.useAPI) {
      try {
        return await apiDataService.getTypeData(genderFilter);
      } catch (error) {
        console.warn('API no disponible, usando datos locales:', error);
        return this.getLocalTypeData(genderFilter);
      }
    } else {
      return this.getLocalTypeData(genderFilter);
    }
  }

  // Método local para datos de tipo (fallback)
  getLocalTypeData(genderFilter = '') {
    const typeMap = {};
    personas.forEach((p) => {
      if (
        typeof p.tipo === 'string' &&
        (genderFilter === '' || p.genero === genderFilter)
      ) {
        const tipo = p.tipo.toLowerCase();
        typeMap[tipo] = (typeMap[tipo] || 0) + 1;
      }
    });
    return Object.entries(typeMap).map(([tipo, count]) => ({ tipo, count }));
  }

  // Método unificado para obtener datos por hora
  async getHourlyData() {
    if (this.useAPI) {
      try {
        return await apiDataService.getHourlyData();
      } catch (error) {
        console.warn('API no disponible, usando datos locales:', error);
        return this.getLocalHourlyData();
      }
    } else {
      return this.getLocalHourlyData();
    }
  }

  // Método local para datos por hora (fallback)
  getLocalHourlyData() {
    const hourMap = {};
    
    // Inicializar horas de 6 a 22
    for (let hour = 6; hour <= 22; hour++) {
      hourMap[hour] = new Set();
    }

    personas.forEach((p) => {
      if (!p.timestamp) return;
      const date = new Date(p.timestamp);
      const hour = date.getUTCHours();
      if (hour >= 6 && hour <= 22) {
        hourMap[hour].add(p.id);
      }
    });

    return Object.entries(hourMap).map(([hour, idSet]) => ({
      hour: parseInt(hour),
      totalVisitors: idSet.size,
    }));
  }

  // Método para verificar el estado de la API
  async checkAPIStatus() {
    try {
      await apiDataService.getData();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new HybridDataService();
