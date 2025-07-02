# API Integration Documentation

## Cambios Realizados

Se ha modificado el proyecto para usar datos dinámicos de una API en lugar de datos locales estáticos. Los cambios principales incluyen:

### 1. Nuevo Servicio de API (`src/services/apiService.js`)

- **URL de la API**: `https://84f7-35-234-1-134.ngrok-free.app/api/datos`
- **Caché inteligente**: Los datos se almacenan en caché por 30 segundos para mejorar el rendimiento
- **Manejo de errores**: Si la API falla, se usan datos en caché o datos por defecto
- **Métodos específicos**: Para acceder a cada tipo de dato de forma independiente

### 2. Estructura de Datos de la API

La API devuelve la siguiente estructura:

```json
{
  "conte_edad": {
    "18 -25": 6,
    "25 - 32": 4,
    "32 o mas": 1
  },
  "conte_hora": {
    "12": 3,
    "22": 4,
    "7": 3,
    "8": 1
  },
  "conte_sexo": {
    "Femenino": 5,
    "Masculino": 6
  },
  "conte_tipo": {
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
      "Administrativo": 1,
      "Docente": 0,
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

### 3. Componentes Modificados

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

### 4. Nuevo Componente: `CrossTableChart.vue`

Muestra la tabla cruzada de tipo por edad usando gráfico de barras agrupadas.

### 5. Nuevo Dashboard: `ApiDashboard.vue`

Dashboard completo que muestra:
- Cards de resumen con totales
- Todos los gráficos integrados
- Estado de conexión en tiempo real
- Botón de actualización global
- Indicador de última actualización

### 6. Características Principales

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

### 7. Rutas Agregadas

- `/api-dashboard`: Nuevo dashboard principal con datos de la API

### 8. Instalación y Uso

1. Asegúrate de que la API esté funcionando en `https://84f7-35-234-1-134.ngrok-free.app/api/datos`
2. Los componentes se conectarán automáticamente y comenzarán a mostrar datos
3. Si la API no está disponible, se mostrarán mensajes de error apropiados

### 9. Configuración

La URL de la API puede cambiarse editando el archivo `src/services/apiService.js`:

```javascript
this.baseUrl = 'https://nueva-url-api.com/api';
```

### 10. Beneficios

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
