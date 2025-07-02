class ApiService {
  constructor() {
    this.baseUrl = 'https://84f7-35-234-1-134.ngrok-free.app/api';
    this.cache = null;
    this.lastFetch = null;
    this.cacheTimeout = 30000; // 30 segundos de cache
  }

  async fetchData() {
    const now = Date.now();
    
    // Si tenemos datos en cache y no han expirado, los devolvemos
    if (this.cache && this.lastFetch && (now - this.lastFetch) < this.cacheTimeout) {
      return this.cache;
    }

    try {
      const response = await fetch(`${this.baseUrl}/datos`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Guardar en cache
      this.cache = data;
      this.lastFetch = now;
      
      return data;
    } catch (error) {
      console.error('Error fetching data from API:', error);
      
      // Si hay datos en cache, devolverlos aunque hayan expirado
      if (this.cache) {
        console.warn('Using cached data due to API error');
        return this.cache;
      }
      
      // Si no hay cache, devolver datos por defecto
      return this.getDefaultData();
    }
  }

  getDefaultData() {
    return {
      conte_edad: {},
      conte_hora: {},
      conte_sexo: {},
      conte_tipo: {},
      tabla_cruzada_tipo_edad: {}
    };
  }

  // Métodos específicos para cada tipo de dato
  async getAgeData() {
    const data = await this.fetchData();
    return data.conte_edad || {};
  }

  async getHourData() {
    const data = await this.fetchData();
    return data.conte_hora || {};
  }

  async getGenderData() {
    const data = await this.fetchData();
    return data.conte_sexo || {};
  }

  async getTypeData() {
    const data = await this.fetchData();
    return data.conte_tipo || {};
  }

  async getCrossTableData() {
    const data = await this.fetchData();
    return data.tabla_cruzada_tipo_edad || {};
  }

  // Método para invalidar cache y forzar nueva consulta
  invalidateCache() {
    this.cache = null;
    this.lastFetch = null;
  }
}

export default new ApiService();
