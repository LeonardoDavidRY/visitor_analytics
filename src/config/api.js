// Configuración de la API
export const API_CONFIG = {
  // URL base de la API - usando proxy local para evitar CORS
  BASE_URL: '/api',
  
  // URL directa para la API online (ngrok) - solo para referencia
  ONLINE_URL: 'https://bdb48043244f.ngrok-free.app/api',
  
  // URL local para detecciones (localhost)
  LOCAL_URL: 'http://10.119.2.148:8080/api',
  
  // Configuración de entorno
  USE_PROXY: process.env.NODE_ENV === 'development',
  
  // Headers necesarios para ngrok
  ONLINE_HEADERS: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
  },
  
  // Headers para local
  LOCAL_HEADERS: {
    'Content-Type': 'application/json'
  },
  
  // Timeout para cache (30 segundos)
  CACHE_TIMEOUT: 30000,
  
  // Endpoints disponibles
  ENDPOINTS: {
    // Para API online (ngrok)
    DATOS: '/datos',
    // Para API local
    TIMESTAMPS: '/detecciones/timestamps',
    DETECCIONES: '/detecciones'
  }
};

// Función helper para obtener la URL completa para la API online
export const getOnlineApiUrl = (endpoint = '') => {
  if (API_CONFIG.USE_PROXY) {
    // En desarrollo, usar el proxy
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  } else {
    // En producción, usar la URL directa
    return `${API_CONFIG.ONLINE_URL}${endpoint}`;
  }
};

// Función helper para obtener la URL completa para la API local
export const getLocalApiUrl = (endpoint = '') => {
  if (API_CONFIG.USE_PROXY) {
    // En desarrollo, usar el proxy
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  } else {
    // En producción, usar la URL directa
    return `${API_CONFIG.LOCAL_URL}${endpoint}`;
  }
};

// Función helper para obtener los headers correctos según el entorno
export const getApiHeaders = (isLocal = false) => {
  if (API_CONFIG.USE_PROXY) {
    // En desarrollo con proxy, headers simples
    return {
      'Content-Type': 'application/json'
    };
  } else {
    // En producción, headers específicos por API
    return isLocal ? API_CONFIG.LOCAL_HEADERS : API_CONFIG.ONLINE_HEADERS;
  }
};

// Función helper para actualizar la URL base (legacy)
export const updateApiUrl = (newUrl) => {
  API_CONFIG.BASE_URL = newUrl;
};

// Funciones para cambiar entre proxy y URL directa (legacy)
export const useProxy = () => {
  API_CONFIG.BASE_URL = '/api';
};

export const useOnlineUrl = (newUrl = null) => {
  if (newUrl) {
    API_CONFIG.ONLINE_URL = newUrl;
  }
  API_CONFIG.BASE_URL = API_CONFIG.ONLINE_URL;
};
