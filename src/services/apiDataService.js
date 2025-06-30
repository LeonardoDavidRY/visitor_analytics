import ApiFormularioClient from '@/clients/ApiFormularioClient.js';

class ApiDataService {
  constructor() {
    this.data = null;
    this.lastFetch = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  async getData() {
    const now = Date.now();
    
    // Si tenemos datos en cache y no han expirado, los retornamos
    if (this.data && this.lastFetch && (now - this.lastFetch) < this.cacheTimeout) {
      return this.data;
    }

    try {
      this.data = await ApiFormularioClient.consultarDatosAPI();
      this.lastFetch = now;
      return this.data;
    } catch (error) {
      console.error('Error al obtener datos de la API:', error);
      
      // Si hay datos en cache, los retornamos aunque hayan expirado
      if (this.data) {
        console.warn('Usando datos en cache debido a error de API');
        return this.data;
      }
      
      throw error;
    }
  }

  // Transforma los datos de edad de la API al formato esperado por AgeBarChart
  async getAgeData() {
    const data = await this.getData();
    const ageData = data.conteo_edad || {};
    
    return Object.entries(ageData).map(([range, count]) => ({
      edad: range,
      total: count
    }));
  }

  // Transforma los datos de tipo de la API al formato esperado por TypePieChart
  async getTypeData(genderFilter = '') {
    const data = await this.getData();
    
    // Si hay filtro de género, necesitamos usar tabla_cruzada_tipo_edad
    // Por ahora retornamos conteo_tipo ya que no hay tabla cruzada por género
    const typeData = data.conteo_tipo || {};
    
    return Object.entries(typeData).map(([type, count]) => ({
      tipo: type.toLowerCase(),
      count: count
    }));
  }

  // Transforma los datos de hora de la API al formato esperado por TimelineChart
  async getHourlyData() {
    const data = await this.getData();
    const hourData = data.conteo_hora || {};
    
    // Crear un mapa de horas de 6 a 22 con valores por defecto en 0
    const hourlyMap = {};
    for (let hour = 6; hour <= 22; hour++) {
      hourlyMap[hour] = 0;
    }
    
    // Llenar con los datos de la API
    Object.entries(hourData).forEach(([hour, count]) => {
      const hourInt = parseInt(hour);
      if (hourInt >= 6 && hourInt <= 22) {
        hourlyMap[hourInt] = count;
      }
    });
    
    return Object.entries(hourlyMap).map(([hour, count]) => ({
      hour: parseInt(hour),
      totalVisitors: count
    }));
  }

  // Obtiene los datos de género
  async getGenderData() {
    const data = await this.getData();
    return data.conteo_sexo || {};
  }

  // Obtiene la tabla cruzada tipo-edad
  async getCrossTableTypeAge() {
    const data = await this.getData();
    return data.tabla_cruzada_tipo_edad || {};
  }
}

export default new ApiDataService();
