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
      console.log('ApiDataService: Usando datos en cache');
      return this.data;
    }

    try {
      console.log('ApiDataService: Obteniendo datos frescos de la API');
      this.data = await ApiFormularioClient.consultarDatosAPI();
      this.lastFetch = now;
      console.log('ApiDataService: Datos obtenidos de la API:', this.data);
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
    
    return Object.entries(ageData)
      .sort((a, b) => {
        // Ordenar por el primer número de cada rango
        const aNum = parseInt(a[0].split(/[-\s]/)[0]);
        const bNum = parseInt(b[0].split(/[-\s]/)[0]);
        return aNum - bNum;
      })
      .map(([range, count]) => ({
        edad: range,
        total: count
      }));
  }

  // Transforma los datos de tipo de la API al formato esperado por TypePieChart
  async getTypeData(genderFilter = '') {
    const data = await this.getData();
    
    // Por ahora la API no soporta filtro por género en conteo_tipo
    // Se ignora el filtro de género
    const typeData = data.conteo_tipo || {};
    
    return Object.entries(typeData).map(([type, count]) => ({
      tipo: type.toLowerCase(), // Convertir a minúsculas para consistencia
      count: count
    }));
  }

  // Transforma los datos de hora de la API al formato esperado por TimelineChart
  async getHourlyData() {
    const data = await this.getData();
    const hourData = data.conteo_hora || {};
    
    // Crear un mapa de horas con los datos de la API
    const hourlyMap = {};
    
    // Llenar con los datos de la API
    Object.entries(hourData).forEach(([hour, count]) => {
      const hourInt = parseInt(hour);
      hourlyMap[hourInt] = count;
    });
    
    // Ordenar por hora y retornar
    return Object.entries(hourlyMap)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        totalVisitors: count
      }));
  }

  // Obtiene los datos de género
  async getGenderData() {
    const data = await this.getData();
    const genderData = data.conteo_sexo || {};
    
    console.log('ApiDataService: Datos de género de API:', genderData);
    
    return Object.entries(genderData).map(([gender, count]) => ({
      genero: gender,
      count: count
    }));
  }

  // Obtiene la tabla cruzada tipo-edad
  async getCrossTableTypeAge() {
    const data = await this.getData();
    return data.tabla_cruzada_tipo_edad || {};
  }
}

export default new ApiDataService();
