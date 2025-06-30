import apiDataService from './apiDataService.js';
import personas from '@/data/registro_personas_biblioteca.json';

class HybridDataService {
  constructor() {
    this.useAPI = true; // Flag para determinar si usar API o datos locales
  }

  // Método para alternar entre API y datos locales
  setDataSource(useAPI) {
    console.log('HybridDataService: Estableciendo fuente de datos a', useAPI ? 'API' : 'Local');
    this.useAPI = useAPI;
  }

  // Método unificado para obtener datos de edad
  async getAgeData() {
    console.log('HybridDataService: Obteniendo datos de edad, useAPI =', this.useAPI);
    if (this.useAPI) {
      try {
        const data = await apiDataService.getAgeData();
        console.log('HybridDataService: Datos de edad de API obtenidos:', data);
        return data;
      } catch (error) {
        console.warn('API no disponible, usando datos locales:', error);
        return this.getLocalAgeData();
      }
    } else {
      console.log('HybridDataService: Usando datos locales de edad');
      return this.getLocalAgeData();
    }
  }

  // Método local para datos de edad (fallback)
  getLocalAgeData() {
    const ageMap = {};
    personas.forEach((p) => {
      if (typeof p.edad === 'number' && p.id) {
        // Crear rangos similares a los de la API
        let ageRange;
        if (p.edad >= 18 && p.edad <= 25) {
          ageRange = '18 -25';
        } else if (p.edad > 25 && p.edad <= 32) {
          ageRange = '25 - 32';
        } else if (p.edad > 32) {
          ageRange = '32 o mas';
        } else {
          return; // Ignorar edades menores a 18
        }
        
        if (!ageMap[ageRange]) ageMap[ageRange] = new Set();
        ageMap[ageRange].add(p.id);
      }
    });
    
    return Object.entries(ageMap)
      .sort((a, b) => {
        const order = {'18 -25': 1, '25 - 32': 2, '32 o mas': 3};
        return order[a[0]] - order[b[0]];
      })
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
        // Capitalizar la primera letra para que coincida con el formato de la API
        const tipo = p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1).toLowerCase();
        typeMap[tipo] = (typeMap[tipo] || 0) + 1;
      }
    });
    return Object.entries(typeMap).map(([tipo, count]) => ({ 
      tipo: tipo.toLowerCase(), // Convertir a minúsculas para consistencia 
      count 
    }));
  }

  // Método unificado para obtener datos por hora
  async getHourlyData() {
    console.log('HybridDataService: Obteniendo datos por hora, useAPI =', this.useAPI);
    if (this.useAPI) {
      try {
        const data = await apiDataService.getHourlyData();
        console.log('HybridDataService: Datos por hora de API obtenidos:', data);
        return data;
      } catch (error) {
        console.error('HybridDataService: Error obteniendo datos por hora de API, usando datos locales:', error);
        return this.getLocalHourlyData();
      }
    } else {
      const data = this.getLocalHourlyData();
      console.log('HybridDataService: Datos por hora locales obtenidos:', data);
      return data;
    }
  }

  // Método unificado para obtener datos de género
  async getGenderData() {
    console.log('HybridDataService: Obteniendo datos de género, useAPI =', this.useAPI);
    if (this.useAPI) {
      try {
        const data = await apiDataService.getGenderData();
        console.log('HybridDataService: Datos de género de API obtenidos:', data);
        return data;
      } catch (error) {
        console.error('HybridDataService: Error obteniendo datos de género de API, usando datos locales:', error);
        return this.getLocalGenderData();
      }
    } else {
      const data = this.getLocalGenderData();
      console.log('HybridDataService: Datos de género locales obtenidos:', data);
      return data;
    }
  }

  // Método local para datos por hora (fallback)
  getLocalHourlyData() {
    const hourlyMap = {};
    personas.forEach((p) => {
      const hour = new Date(p.timestamp).getHours();
      if (!hourlyMap[hour]) {
        hourlyMap[hour] = new Set();
      }
      hourlyMap[hour].add(p.id);
    });
    
    return Object.entries(hourlyMap)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([hora, idSet]) => ({ hora: parseInt(hora), total: idSet.size }));
  }

  // Método local para datos de género (fallback)
  getLocalGenderData() {
    const genderMap = {};
    personas.forEach((p) => {
      const genero = p.sexo || 'No especificado';
      if (!genderMap[genero]) {
        genderMap[genero] = new Set();
      }
      genderMap[genero].add(p.id);
    });
    
    return Object.entries(genderMap)
      .map(([genero, idSet]) => ({ 
        genero: genero.charAt(0).toUpperCase() + genero.slice(1),
        count: idSet.size 
      }))
      .sort((a, b) => b.count - a.count);
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
