import { API_CONFIG } from '@/config/api.js';

class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.cache = null;
    this.lastFetch = null;
    this.cacheTimeout = API_CONFIG.CACHE_TIMEOUT;
  }

  async fetchData() {
    const now = Date.now();
    
    // Si tenemos datos en cache y no han expirado, los devolvemos
    if (this.cache && this.lastFetch && (now - this.lastFetch) < this.cacheTimeout) {
      console.log('📦 Usando datos del cache');
      return this.cache;
    }

    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.DATOS}`;
    console.log('🌐 Realizando petición a:', url);
    console.log('📋 Headers:', API_CONFIG.HEADERS);

    try {
      const response = await fetch(url, {
        headers: API_CONFIG.HEADERS
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Datos recibidos exitosamente:', data);
      
      // Guardar en cache
      this.cache = data;
      this.lastFetch = now;
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching data from API:', error);
      console.error('🔍 URL intentada:', url);
      console.error('📋 Headers usados:', API_CONFIG.HEADERS);
      
      // Si hay datos en cache, devolverlos aunque hayan expirado
      if (this.cache) {
        console.warn('⚠️ Usando datos del cache debido al error de API');
        return this.cache;
      }
      
      // Si no hay cache, devolver datos por defecto
      console.warn('⚠️ Usando datos por defecto debido al error de API');
      return this.getDefaultData();
    }
  }

  getDefaultData() {
    return {
      conteo_edad: {},
      conteo_hora: {},
      conteo_sexo: {},
      conteo_tipo: {},
      tabla_cruzada_tipo_edad: {}
    };
  }

  // Métodos específicos para cada tipo de dato
  async getAgeData() {
    const data = await this.fetchData();
    return data.conteo_edad || {};
  }

  async getHourData() {
    const data = await this.fetchData();
    return data.conteo_hora || {};
  }

  async getGenderData() {
    const data = await this.fetchData();
    return data.conteo_sexo || {};
  }

  async getTypeData() {
    const data = await this.fetchData();
    return data.conteo_tipo || {};
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

  // Método para actualizar la URL base
  updateBaseUrl(newUrl) {
    this.baseUrl = newUrl;
    API_CONFIG.BASE_URL = newUrl;
    this.invalidateCache(); // Invalidar cache al cambiar URL
  }

  // Método para obtener la URL actual
  getCurrentUrl() {
    return this.baseUrl;
  }
}

export default new ApiService();
