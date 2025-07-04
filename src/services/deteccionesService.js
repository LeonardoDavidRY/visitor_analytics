import { API_CONFIG } from '@/config/api.js';

class DeteccionesService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timestampsCache = null;
    this.deteccionesCache = new Map(); // Cache por timestamp
    this.lastTimestampsFetch = null;
    this.cacheTimeout = API_CONFIG.CACHE_TIMEOUT;
  }

  // Obtener todos los timestamps disponibles
  async fetchTimestamps() {
    const now = Date.now();
    
    // Si tenemos timestamps en cache y no han expirado, los devolvemos
    if (this.timestampsCache && this.lastTimestampsFetch && 
        (now - this.lastTimestampsFetch) < this.cacheTimeout) {
      console.log('📦 Usando timestamps del cache');
      return this.timestampsCache;
    }

    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.TIMESTAMPS}`;
    console.log('🌐 Realizando petición a:', url);

    try {
      const response = await fetch(url, {
        headers: API_CONFIG.LOCAL_HEADERS
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Timestamps recibidos exitosamente:', data);
      
      // Guardar en cache
      this.timestampsCache = data;
      this.lastTimestampsFetch = now;
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching timestamps:', error);
      
      // Si hay datos en cache, devolverlos aunque hayan expirado
      if (this.timestampsCache) {
        console.warn('⚠️ Usando timestamps del cache debido al error');
        return this.timestampsCache;
      }
      
      // Si no hay cache, devolver estructura por defecto
      return this.getDefaultTimestamps();
    }
  }

  // Obtener detecciones para un timestamp específico
  async fetchDeteccionesPorTimestamp(timestamp) {
    // Verificar cache
    if (this.deteccionesCache.has(timestamp)) {
      console.log(`📦 Usando detecciones del cache para ${timestamp}`);
      return this.deteccionesCache.get(timestamp);
    }

    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.DETECCIONES}?segundo=${encodeURIComponent(timestamp)}`;
    console.log('🌐 Realizando petición a:', url);

    try {
      const response = await fetch(url, {
        headers: API_CONFIG.LOCAL_HEADERS
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Detecciones recibidas exitosamente:', data);
      
      // Guardar en cache
      this.deteccionesCache.set(timestamp, data);
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching detecciones:', error);
      
      // Devolver estructura por defecto
      return this.getDefaultDetecciones(timestamp);
    }
  }

  // Obtener detecciones agrupadas por intervalos de tiempo (para timeline)
  async getDeteccionesAgrupadas(intervaloMinutos = 5) {
    try {
      const timestampsData = await this.fetchTimestamps();
      
      if (!timestampsData.success || !timestampsData.timestamps) {
        return {};
      }

      // Agrupar timestamps por intervalos
      const grupos = {};
      
      timestampsData.timestamps.forEach(timestamp => {
        const fecha = new Date(timestamp);
        const minutos = fecha.getMinutes();
        const minutosRedondeados = Math.floor(minutos / intervaloMinutos) * intervaloMinutos;
        
        const claveGrupo = new Date(fecha.getFullYear(), fecha.getMonth(), 
                                   fecha.getDate(), fecha.getHours(), minutosRedondeados)
                          .toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
        
        if (!grupos[claveGrupo]) {
          grupos[claveGrupo] = 0;
        }
        grupos[claveGrupo]++;
      });

      return grupos;
    } catch (error) {
      console.error('Error agrupando detecciones:', error);
      return {};
    }
  }

  // Obtener coordenadas para el mapa de calor (último timestamp disponible o uno específico)
  async getCoordenadasParaHeatmap(timestamp = null) {
    try {
      let targetTimestamp = timestamp;
      
      // Si no se proporciona timestamp, usar el más reciente
      if (!targetTimestamp) {
        const timestampsData = await this.fetchTimestamps();
        if (timestampsData.success && timestampsData.timestamps.length > 0) {
          targetTimestamp = timestampsData.timestamps[0]; // El más reciente
        } else {
          return [];
        }
      }

      const detecciones = await this.fetchDeteccionesPorTimestamp(targetTimestamp);
      
      if (detecciones.success && detecciones.detecciones && detecciones.detecciones.length > 0) {
        // Retornar todas las coordenadas de todas las detecciones
        const coordenadas = [];
        detecciones.detecciones.forEach(deteccion => {
          if (deteccion.coordenadas) {
            coordenadas.push(...deteccion.coordenadas);
          }
        });
        return coordenadas;
      }

      return [];
    } catch (error) {
      console.error('Error obteniendo coordenadas para heatmap:', error);
      return [];
    }
  }

  // Obtener lista de timestamps únicos para selector
  async getTimestampsUnicos() {
    try {
      const timestampsData = await this.fetchTimestamps();
      
      if (timestampsData.success && timestampsData.timestamps) {
        // Eliminar duplicados y ordenar
        const uniqueTimestamps = [...new Set(timestampsData.timestamps)];
        return uniqueTimestamps.sort((a, b) => new Date(b) - new Date(a)); // Más recientes primero
      }

      return [];
    } catch (error) {
      console.error('Error obteniendo timestamps únicos:', error);
      return [];
    }
  }

  getDefaultTimestamps() {
    return {
      total: 0,
      timestamps: [],
      success: false
    };
  }

  getDefaultDetecciones(timestamp) {
    return {
      success: false,
      parametro: timestamp,
      total_encontradas: 0,
      detecciones: [],
      tipo_consulta: "segundo"
    };
  }

  // Métodos para limpiar cache
  invalidateTimestampsCache() {
    this.timestampsCache = null;
    this.lastTimestampsFetch = null;
  }

  invalidateDeteccionesCache(timestamp = null) {
    if (timestamp) {
      this.deteccionesCache.delete(timestamp);
    } else {
      this.deteccionesCache.clear();
    }
  }

  invalidateAllCache() {
    this.invalidateTimestampsCache();
    this.invalidateDeteccionesCache();
  }
}

export default new DeteccionesService();
