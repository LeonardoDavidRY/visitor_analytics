// Configuración de la API
export const API_CONFIG = {
  // URL base de la API - usando proxy local para evitar CORS
  BASE_URL: '/api',
  
  // URL directa para cuando no se use proxy (para reference)
  DIRECT_URL: 'https://bc25-186-69-112-160.ngrok-free.app/api',
  
  // Headers necesarios para ngrok
  HEADERS: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
  },
  
  // Timeout para cache (30 segundos)
  CACHE_TIMEOUT: 30000,
  
  // Endpoints disponibles
  ENDPOINTS: {
    DATOS: '/datos'
  }
};

// Función helper para actualizar la URL base
export const updateApiUrl = (newUrl) => {
  API_CONFIG.BASE_URL = newUrl;
};

// Funciones para cambiar entre proxy y URL directa
export const useProxy = () => {
  API_CONFIG.BASE_URL = '/api';
};

export const useDirectUrl = (newUrl = null) => {
  if (newUrl) {
    API_CONFIG.DIRECT_URL = newUrl;
  }
  API_CONFIG.BASE_URL = API_CONFIG.DIRECT_URL;
};
