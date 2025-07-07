/**
 * Script para actualizar automáticamente la URL de la API local en vue.config.js
 * Uso: node update-local-url.js <nueva-url-local>
 * Ejemplo: node update-local-url.js http://192.168.45.129:8080
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Debes proporcionar la nueva URL de la API local');
  console.log('📖 Uso: node update-local-url.js <nueva-url-local>');
  console.log('📖 Ejemplo: node update-local-url.js http://192.168.45.129:8080');
  process.exit(1);
}

const newLocalUrl = args[0];

// Validar que la URL tenga el formato correcto
if (!newLocalUrl.startsWith('http://') && !newLocalUrl.startsWith('https://')) {
  console.error('❌ La URL debe comenzar con http:// o https://');
  process.exit(1);
}

// Actualizar vue.config.js
const vueConfigPath = path.join(__dirname, 'vue.config.js');
try {
  let vueConfig = fs.readFileSync(vueConfigPath, 'utf8');
  
  // Buscar y reemplazar la URL en la configuración del proxy para detecciones
  const urlRegex = /\/api\/detecciones':\s*{[\s\S]*?target:\s*['"`]http:\/\/[^'"`]+['"`]/;
  vueConfig = vueConfig.replace(urlRegex, (match) => {
    return match.replace(/target:\s*['"`]http:\/\/[^'"`]+['"`]/, `target: '${newLocalUrl}'`);
  });
  
  fs.writeFileSync(vueConfigPath, vueConfig);
  console.log('✅ vue.config.js actualizado correctamente');
} catch (error) {
  console.error('❌ Error actualizando vue.config.js:', error.message);
}

// Actualizar src/config/api.js
const apiConfigPath = path.join(__dirname, 'src', 'config', 'api.js');
try {
  let apiConfig = fs.readFileSync(apiConfigPath, 'utf8');
  
  // Buscar y reemplazar la URL local
  const localUrlRegex = /LOCAL_URL:\s*['"`]http:\/\/[^'"`]+['"`]/;
  apiConfig = apiConfig.replace(localUrlRegex, `LOCAL_URL: '${newLocalUrl}/api'`);
  
  fs.writeFileSync(apiConfigPath, apiConfig);
  console.log('✅ src/config/api.js actualizado correctamente');
} catch (error) {
  console.error('❌ Error actualizando src/config/api.js:', error.message);
}

console.log('🎉 URLs actualizadas correctamente');
console.log('📋 Nueva URL local:', newLocalUrl);
console.log('ℹ️ Reinicia el servidor de desarrollo para aplicar los cambios');
