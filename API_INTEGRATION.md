# API Integration Documentation

## Configuración de APIs Dual

Se ha configurado el proyecto para usar **dos APIs diferentes** según el tipo de datos:

### 1. API Online (ngrok) - Para datos generales de analytics

- **URL**: `https://cc25-34-23-145-148.ngrok-free.app/api/datos`
- **Uso**: Datos de conteos generales (edad, género, hora, tipo, tablas cruzadas)
- **Servicio**: `src/services/apiService.js`
- **Headers**: Incluye `ngrok-skip-browser-warning: true`

### 2. API Local - Para detecciones en tiempo real

- **URL**: `http://192.168.45.129:8080/api/detecciones/timestamps`
- **Uso**: Datos de detecciones específicas con timestamps
- **Servicio**: `src/services/deteccionesService.js`
- **Endpoints**:
  - `/detecciones/timestamps` - Obtener lista de timestamps disponibles
  - `/detecciones?segundo=<timestamp>` - Obtener detecciones para un timestamp específico

### 3. Configuración de Proxy (vue.config.js)

El proyecto usa un proxy para evitar problemas de CORS:

```javascript
proxy: {
  '/api/datos': {
    target: 'https://cc25-34-23-145-148.ngrok-free.app',
    changeOrigin: true,
    secure: true,
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  },
  '/api/detecciones': {
    target: 'http://192.168.45.129:8080',
    changeOrigin: true,
    secure: false
  }
}
```

### 4. Estructura de Datos

#### API Online (datos generales):

```json
{
  "conteo_edad": {
    "18 -25": 6,
    "25 - 32": 4,
    "32 o mas": 1
  },
  "conteo_hora": {
    "12": 3,
    "22": 4,
    "7": 3,
    "8": 1
  },
  "conteo_sexo": {
    "Femenino": 5,
    "Masculino": 6
  },
  "conteo_tipo": {
    "Administrativo": 1,
    "Docente": 2,
    "Estudiante": 5,
    "Externo": 3
  },
  "tabla_cruzada_tipo_edad": {
    "18 -25": {
      "Administrativo": 0,
      "Docente": 1,
      "Estudiante": 3,
      "Externo": 2
    },
    "25 - 32": {
      "Administrativo": 0,
      "Docente": 1,
      "Estudiante": 2,
      "Externo": 1
    },
    "32 o mas": {
      "Administrativo": 0,
      "Docente": 1,
      "Estudiante": 0,
      "Externo": 0
    }
  }
}
```

#### API Local (detecciones):

```json
{
  "success": true,
  "timestamps": ["2024-01-01 10:00:00", "2024-01-01 10:00:01"],
  "detecciones": [
    {
      "id": 1,
      "timestamp": "2024-01-01 10:00:00",
      "x": 100,
      "y": 200,
      "tipo": "Estudiante"
    }
  ]
}
```

### 5. Scripts de Actualización de URLs

#### Actualizar URL de ngrok (API Online):

```bash
node update-ngrok-url.js https://nueva-url.ngrok-free.app
```

#### Actualizar URL local:

```bash
node update-local-url.js http://192.168.45.129:8080
```

Estos scripts actualizan automáticamente:

- `vue.config.js` - Configuración del proxy
- `src/config/api.js` - URLs de las APIs

### 6. Paneles de Prueba

El dashboard incluye dos paneles de prueba:

1. **Panel API Online**: Prueba la conexión con la API de ngrok
2. **Panel API Local**: Prueba la conexión con la API local y permite seleccionar timestamps

### 7. Caché Inteligente

Ambos servicios implementan un sistema de caché:

- **Tiempo de vida**: 30 segundos
- **Invalidación manual**: Disponible en los paneles de prueba
- **Fallback**: Datos en caché si la API falla

### 8. Manejo de Errores

- **Conexión fallida**: Usa datos en caché si están disponibles
- **Datos por defecto**: Estructura vacía si no hay caché
- **Logs detallados**: En consola para debugging

## Uso

1. **Desarrollo**: El proxy maneja automáticamente las peticiones
2. **Producción**: Las URLs se configuran directamente en los servicios
3. **Pruebas**: Usa los paneles de prueba en el dashboard

## Configuración Inicial

1. Asegúrate de que ambas APIs estén disponibles
2. Actualiza las URLs si es necesario usando los scripts
3. Reinicia el servidor de desarrollo si cambias la configuración del proxy

```bash
npm run serve
```

### 9. Componentes Modificados

#### `TypePieChart.vue`
- Ahora usa `apiService` en lugar de datos locales
- Actualización automática cada 30 segundos
- Estados de carga y error
- Botón de actualización manual
- Colores consistentes en lugar de aleatorios

#### `AgeBarChart.vue`
- Adaptado para trabajar con rangos de edad de la API
- Manejo de estados de carga y error
- Actualización automática
- Ordenamiento inteligente de rangos de edad

#### `TimelineChart.vue`
- Simplificado para usar datos de hora de la API
- Removido el filtro por cámara (no disponible en la API actual)
- Estados de carga y error
- Actualización automática

#### `PersonCountChart.vue`
- Adaptado para usar datos de hora de la API
- Mantenidos los controles de tipo de gráfico (línea/barras)
- Estados de carga y error

### 10. Nuevo Componente: `CrossTableChart.vue`

Muestra la tabla cruzada de tipo por edad usando gráfico de barras agrupadas.

### 11. Nuevo Dashboard: `ApiDashboard.vue`

Dashboard completo que muestra:
- Cards de resumen con totales
- Todos los gráficos integrados
- Estado de conexión en tiempo real
- Botón de actualización global
- Indicador de última actualización

### 12. Características Principales

#### Actualización en Tiempo Real
- Los datos se actualizan automáticamente cada 30 segundos
- Cache inteligente para reducir llamadas innecesarias a la API

#### Manejo de Errores Robusto
- Si la API falla, se muestran datos en caché
- Mensajes de error claros para el usuario
- Estados de carga informativos

#### Interfaz Mejorada
- Indicadores visuales de estado de conexión
- Botones de actualización manual
- Estados de carga consistentes
- Colores predefinidos para mejor consistencia visual

### 13. Rutas Agregadas

- `/api-dashboard`: Nuevo dashboard principal con datos de la API

### 14. Instalación y Uso

1. Asegúrate de que la API esté funcionando en `https://84f7-35-234-1-134.ngrok-free.app/api/datos`
2. Los componentes se conectarán automáticamente y comenzarán a mostrar datos
3. Si la API no está disponible, se mostrarán mensajes de error apropiados

### 15. Configuración

La URL de la API puede cambiarse editando el archivo `src/services/apiService.js`:

```javascript
this.baseUrl = 'https://nueva-url-api.com/api';
```

### 16. Beneficios

- **Datos en tiempo real**: Los dashboards se actualizan automáticamente
- **Sin dependencia de archivos locales**: Todo viene de la API
- **Robusto**: Maneja errores y fallos de conexión elegantemente
- **Escalable**: Fácil agregar nuevos tipos de datos cuando estén disponibles en la API
- **Performante**: Sistema de caché reduce la carga en el servidor

## Próximos Pasos

1. Considerar agregar más endpoints a la API para datos más granulares
2. Implementar filtros por fecha/período cuando estén disponibles
3. Agregar autenticación si es necesario
4. Considerar WebSockets para actualizaciones en tiempo real más eficientes
