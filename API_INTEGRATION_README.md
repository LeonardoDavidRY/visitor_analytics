# Integración con API - Visitor Analytics

## Resumen de Cambios

Se ha implementado la integración con la API para los componentes de gráficas, manteniendo los mapas y rutas usando datos locales según lo solicitado.

## Componentes Modificados

### 1. Gráficas que ahora usan la API:
- **AgeBarChart** - Gráfico de edades (usa `conteo_edad`)
- **TypePieChart** - Gráfico de tipos de persona (usa `conteo_tipo` y `conteo_sexo`)
- **TimelineChart** - Timeline de visitantes por hora (usa `conteo_hora`)
- **PersonCountChart** - Contador de personas por hora (usa `conteo_hora`)

### 2. Componentes que siguen usando datos locales:
- **HeatmapChart** - Mapa de calor (coordenadas)
- **PersonRoutes** - Rutas de personas (coordenadas y cámaras)
- **LibraryMap** - Mapa de la biblioteca (coordenadas)

## Nuevos Archivos Creados

1. **`src/clients/ApiFormularioClient.js`** - Cliente HTTP para la API
2. **`src/services/apiDataService.js`** - Servicio que transforma datos de la API
3. **`src/services/hybridDataService.js`** - Servicio híbrido con fallback automático
4. **`src/components/DataSourceControl.vue`** - Control para alternar fuente de datos
5. **`src/views/AdminView.vue`** - Panel de administración

## Características Implementadas

### 🔄 Fallback Automático
- Si la API no está disponible, automáticamente usa datos locales
- No interrumpe la experiencia del usuario
- Cache de 5 minutos para optimizar rendimiento

### ⚙️ Panel de Administración
- Accesible desde `/admin` 
- Control visual para alternar entre API y datos locales
- Monitor del estado de la API en tiempo real
- Vista previa de los gráficos afectados

### 📊 Transformación de Datos
El servicio transforma automáticamente los datos de la API al formato esperado:

```javascript
// Formato API
{
  "conteo_edad": { "18 -25": 7, "25 - 32": 4 },
  "conteo_hora": { "12": 4, "22": 4 },
  "conteo_tipo": { "Administrativo": 1, "Docente": 3 }
}

// Formato interno
[
  { edad: "18 -25", total: 7 },
  { hour: 12, totalVisitors: 4 },
  { tipo: "administrativo", count: 1 }
]
```

## Configuración de la API

### URL Configurada:
```
https://5ea4-186-69-112-160.ngrok-free.app/api/datos
```

### Headers Requeridos:
- Método: GET
- Content-Type: application/json

## Estructura Esperada de la API

```json
{
  "conteo_edad": {
    "18 -25": 7,
    "25 - 32": 4,
    "32 o mas": 1
  },
  "conteo_hora": {
    "12": 4,
    "22": 4,
    "7": 3,
    "8": 1
  },
  "conteo_sexo": {
    "Femenino": 6,
    "Masculino": 6
  },
  "conteo_tipo": {
    "Administrativo": 1,
    "Docente": 3,
    "Estudiante": 5,
    "Externo": 3
  },
  "tabla_cruzada_tipo_edad": {
    "18 -25": {
      "Administrativo": 0,
      "Docente": 2,
      "Estudiante": 3,
      "Externo": 2
    }
  }
}
```

## Uso

### 1. Navegación Normal
- Todos los gráficos funcionarán automáticamente con la API
- Si hay problemas de conexión, usarán datos locales sin interrupciones

### 2. Panel de Administración
- Ir a `/admin` 
- Usar el toggle para cambiar entre API y datos locales
- Monitorear el estado de conexión
- Ver vista previa de los gráficos afectados

### 3. Programáticamente
```javascript
import hybridDataService from '@/services/hybridDataService.js';

// Cambiar a datos locales
hybridDataService.setDataSource(false);

// Cambiar a API
hybridDataService.setDataSource(true);

// Verificar estado de la API
const isAPIAvailable = await hybridDataService.checkAPIStatus();
```

## Beneficios

✅ **Robustez**: Fallback automático sin interrupciones  
✅ **Flexibilidad**: Control manual sobre la fuente de datos  
✅ **Rendimiento**: Cache inteligente para evitar llamadas innecesarias  
✅ **Compatibilidad**: Los mapas siguen funcionando con datos locales  
✅ **Monitoreo**: Estado de la API visible en tiempo real  
✅ **Escalabilidad**: Fácil extensión para nuevos endpoints  

## Comandos para Pruebas

```bash
# Ejecutar el proyecto
npm run serve

# Navegar a diferentes vistas para probar:
# - http://localhost:8080/agebar (Gráfico de edades)
# - http://localhost:8080/typepie (Gráfico de tipos)
# - http://localhost:8080/timeline (Timeline)
# - http://localhost:8080/admin (Panel de administración)
```

## Troubleshooting

### API no responde
1. Verificar que la URL esté correcta en `ApiFormularioClient.js`
2. Verificar que el servidor ngrok esté ejecutándose
3. Los datos locales se usarán automáticamente como respaldo

### Datos no se actualizan
1. Verificar en el panel de administración el estado de la API
2. El cache se renueva cada 5 minutos automáticamente
3. Cambiar a datos locales y volver a API forzará una actualización

### Errores en consola
1. Revisar la estructura de datos devuelta por la API
2. Verificar que coincida con el formato esperado
3. Los errores se manejan graciosamente con fallback automático
