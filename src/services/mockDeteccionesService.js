import deteccionesHeatmapData from '@/data/mineria_db.detecciones.json';

class MockDeteccionesService {
  constructor() {
    this.mockData = deteccionesHeatmapData;
  }

  /**
   * Obtiene todos los timestamps únicos del dataset
   */
  async getTimestampsUnicos() {
    try {
      const timestamps = this.mockData.map(item => {
        // Extraer la fecha del formato MongoDB
        const dateString = item.timestamp.$date;
        return new Date(dateString).toISOString();
      });
      
      // Ordenar por fecha ASCENDENTE (más antiguo primero - orden cronológico)
      return timestamps.sort((a, b) => new Date(a) - new Date(b));
    } catch (error) {
      console.error('Error obteniendo timestamps:', error);
      throw error;
    }
  }

  /**
   * Obtiene detecciones por timestamp específico
   */
  async fetchDeteccionesPorTimestamp(timestamp) {
    try {
      console.log('🔍 Buscando detecciones para timestamp:', timestamp);
      
      // Encontrar la detección que coincide con el timestamp
      const deteccion = this.mockData.find(item => {
        const dateString = item.timestamp.$date;
        const itemTimestamp = new Date(dateString).toISOString();
        return itemTimestamp === timestamp;
      });

      if (!deteccion) {
        console.warn('⚠️ No se encontró detección para timestamp:', timestamp);
        return {
          success: false,
          mensaje: `No se encontraron detecciones para el timestamp ${timestamp}`,
          total_encontradas: 0,
          detecciones: []
        };
      }

      // Transformar el formato de MongoDB al formato esperado por el componente
      const transformedData = {
        success: true,
        mensaje: 'Detecciones encontradas exitosamente',
        total_encontradas: 1,
        detecciones: [{
          id: deteccion._id.$oid,
          timestamp: new Date(deteccion.timestamp.$date).toISOString(),
          personas: deteccion.personas,
          coordenadas: deteccion.coordenadas
        }]
      };

      console.log('📊 Detecciones transformadas:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching detecciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las detecciones
   */
  async getAllDetecciones() {
    try {
      const transformedData = this.mockData.map(item => ({
        id: item._id.$oid,
        timestamp: new Date(item.timestamp.$date).toISOString(),
        personas: item.personas,
        coordenadas: item.coordenadas
      }));

      // Ordenar por timestamp ascendente (cronológico)
      const sortedData = transformedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      return {
        success: true,
        mensaje: 'Todas las detecciones obtenidas exitosamente',
        total_encontradas: sortedData.length,
        detecciones: sortedData
      };
    } catch (error) {
      console.error('Error obteniendo todas las detecciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas generales
   */
  async getEstadisticas() {
    try {
      const totalDetecciones = this.mockData.length;
      const totalPersonas = this.mockData.reduce((sum, item) => sum + item.personas, 0);
      const totalCoordenadas = this.mockData.reduce((sum, item) => sum + item.coordenadas.length, 0);
      
      const timestamps = this.mockData.map(item => new Date(item.timestamp.$date));
      const fechaInicio = new Date(Math.min(...timestamps));
      const fechaFin = new Date(Math.max(...timestamps));

      return {
        success: true,
        estadisticas: {
          totalDetecciones,
          totalPersonas,
          totalCoordenadas,
          fechaInicio: fechaInicio.toISOString(),
          fechaFin: fechaFin.toISOString(),
          promedioPersonasPorDeteccion: (totalPersonas / totalDetecciones).toFixed(2),
          promedioCoordenadas: (totalCoordenadas / totalDetecciones).toFixed(2)
        }
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Simula una búsqueda con filtros
   */
  async buscarDetecciones(filtros = {}) {
    try {
      let resultados = [...this.mockData];

      // Filtrar por rango de fechas
      if (filtros.fechaInicio) {
        const fechaInicio = new Date(filtros.fechaInicio);
        resultados = resultados.filter(item => {
          const fechaItem = new Date(item.timestamp.$date);
          return fechaItem >= fechaInicio;
        });
      }

      if (filtros.fechaFin) {
        const fechaFin = new Date(filtros.fechaFin);
        resultados = resultados.filter(item => {
          const fechaItem = new Date(item.timestamp.$date);
          return fechaItem <= fechaFin;
        });
      }

      // Filtrar por cantidad mínima de personas
      if (filtros.personasMin) {
        resultados = resultados.filter(item => item.personas >= filtros.personasMin);
      }

      // Filtrar por cantidad máxima de personas
      if (filtros.personasMax) {
        resultados = resultados.filter(item => item.personas <= filtros.personasMax);
      }

      // Transformar resultados
      const transformedData = resultados.map(item => ({
        id: item._id.$oid,
        timestamp: new Date(item.timestamp.$date).toISOString(),
        personas: item.personas,
        coordenadas: item.coordenadas
      }));

      // Ordenar por timestamp ascendente (cronológico)
      const sortedData = transformedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      return {
        success: true,
        mensaje: `Se encontraron ${sortedData.length} detecciones`,
        total_encontradas: sortedData.length,
        detecciones: sortedData,
        filtros: filtros
      };
    } catch (error) {
      console.error('Error buscando detecciones:', error);
      throw error;
    }
  }
}

// Crear una instancia del servicio mock
const mockDeteccionesService = new MockDeteccionesService();

export default mockDeteccionesService;
