class ApiService {
  constructor() {
    // Use proxy in development, direct URL in production
    this.baseUrl = process.env.NODE_ENV === 'development' 
      ? '/api' 
      : 'https://bc25-186-69-112-160.ngrok-free.app/api';
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

    // Try proxy first, then direct URL
    const urls = [
      '/api/datos', // Proxy URL
      'https://bc25-186-69-112-160.ngrok-free.app/api/datos' // Direct URL
    ];

    console.log('Environment:', process.env.NODE_ENV);
    console.log('Base URL configured as:', this.baseUrl);
    console.log('Will try URLs in order:', urls);

    for (const url of urls) {
      try {
        console.log('Fetching data from:', url);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          mode: url.startsWith('http') ? 'cors' : 'same-origin'
        });
        
        if (!response.ok) {
          console.warn(`Request to ${url} failed with status: ${response.status}`);
          continue; // Try next URL
        }
        
        // Verificar que la respuesta sea JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await response.text();
          console.error('API returned non-JSON response:', textResponse.substring(0, 200));
          continue; // Try next URL
        }
        
        const data = await response.json();
        console.log('API data received successfully from:', url, data);
        
        // Guardar en cache
        this.cache = data;
        this.lastFetch = now;
        
        return data;
      } catch (error) {
        console.warn(`Error fetching from ${url}:`, error.message);
        // Continue to next URL
      }
    }

    console.error('All API endpoints failed, checking cache...');
    
    // Si hay datos en cache, devolverlos aunque hayan expirado
    if (this.cache) {
      console.warn('Using cached data due to API error');
      return this.cache;
    }
    
    // Si no hay cache, devolver datos por defecto
    console.warn('No cache available, returning default data');
    return this.getDefaultData();
  }

  getDefaultData() {
    console.log('Returning default data due to API issues');
    const defaultData = {
      conteo_edad: {
        "18 -25": 7,
        "25 - 32": 4,
        "32 o mas": 2
      },
      conteo_hora: {
        "12": 4,
        "22": 4,
        "7": 3,
        "8": 2
      },
      conteo_sexo: {
        "Femenino": 7,
        "Masculino": 6
      },
      conteo_tipo: {
        "Administrativo": 1,
        "Docente": 3,
        "Estudiante": 6,
        "Externo": 3
      },
      tabla_cruzada_tipo_edad: {
        "18 -25": {
          "Administrativo": 0,
          "Docente": 2,
          "Estudiante": 3,
          "Externo": 2
        },
        "25 - 32": {
          "Administrativo": 1,
          "Docente": 0,
          "Estudiante": 2,
          "Externo": 1
        },
        "32 o mas": {
          "Administrativo": 0,
          "Docente": 1,
          "Estudiante": 1,
          "Externo": 0
        }
      }
    };
    console.log('Default data structure:', defaultData);
    return defaultData;
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

  // Método para probar la conectividad de la API
  async testApiConnection() {
    try {
      console.log('Testing API connection to:', this.baseUrl);
      const response = await fetch(this.baseUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API test response status:', response.status);
      console.log('API test response headers:', [...response.headers.entries()]);
      
      const text = await response.text();
      console.log('API test response body:', text.substring(0, 500));
      
      return { success: response.ok, status: response.status, body: text };
    } catch (error) {
      console.error('API test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Método para probar específicamente el endpoint de datos
  async testDataEndpoint() {
    const urls = [
      '/api/datos',
      'https://bc25-186-69-112-160.ngrok-free.app/api/datos'
    ];

    console.log('Testing data endpoints...');
    
    for (const url of urls) {
      console.log(`\n--- Testing ${url} ---`);
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });
        
        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Success! Data received:', data);
          return { success: true, url, data };
        } else {
          const text = await response.text();
          console.log(`Failed. Response: ${text.substring(0, 200)}`);
        }
      } catch (error) {
        console.log(`Error: ${error.message}`);
      }
    }
    
    return { success: false, error: 'All endpoints failed' };
  }
}

export default new ApiService();
