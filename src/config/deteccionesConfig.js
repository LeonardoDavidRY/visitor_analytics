// Configuración para el uso de datos mock vs datos reales
export const CONFIG = {
  // Cambiar a false para usar datos de la API real
  USE_MOCK_DATA: true,
  
  // Configuración de la API real
  API_BASE_URL: process.env.VUE_APP_API_URL || 'http://localhost:8080',
  
  // Configuración de datos mock
  MOCK_DATA_SOURCE: '@/data/mineria_db.detecciones.json',
  
  // Configuración del canvas
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600,
    GRID_SIZE: 20,
    HEATMAP_RADIUS: 30,
    POINT_RADIUS: 6
  },
  
  // Configuración de colores
  COLORS: {
    BACKGROUND: '#f8fafc',
    GRID: '#e5e7eb',
    POINT: '#dc2626',
    POINT_BORDER: '#ffffff',
    POINT_CENTER: '#7c2d12',
    TEXT: '#374151'
  },
  
  // Configuración de intervalos
  INTERVALS: {
    AUTO_REFRESH: 5000, // 5 segundos
    DEFAULT_PLAYBACK: 2000, // 2 segundos
    PLAYBACK_SPEEDS: [
      { value: 500, label: 'Muy Rápido (0.5s)' },
      { value: 1000, label: 'Rápido (1s)' },
      { value: 2000, label: 'Normal (2s)' },
      { value: 3000, label: 'Lento (3s)' },
      { value: 5000, label: 'Muy Lento (5s)' }
    ]
  }
};

// Función para obtener el servicio correcto según la configuración
export const getDeteccionesService = async () => {
  if (CONFIG.USE_MOCK_DATA) {
    const { default: mockService } = await import('@/services/mockDeteccionesService.js');
    return mockService;
  } else {
    const { default: realService } = await import('@/services/deteccionesService.js');
    return realService;
  }
};

// Función para obtener información sobre el origen de los datos
export const getDataSourceInfo = () => {
  return {
    isMock: CONFIG.USE_MOCK_DATA,
    source: CONFIG.USE_MOCK_DATA ? 'Datos Mock (JSON)' : 'API Real',
    description: CONFIG.USE_MOCK_DATA 
      ? 'Usando datos de prueba desde archivo JSON con formato MongoDB'
      : 'Conectado a la API real del sistema de detecciones'
  };
};
