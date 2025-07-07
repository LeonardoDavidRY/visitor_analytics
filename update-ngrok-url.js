/**
 * Script para actualizar automáticamente la URL de ngrok en vue.config.js
 * Uso: node update-ngrok-url.js <nueva-url-ngrok>
 * Ejemplo: node update-ngrok-url.js https://abc123-456-789.ngrok-free.app
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Debes proporcionar la nueva URL de ngrok');
  console.log('📖 Uso: node update-ngrok-url.js <nueva-url-ngrok>');
  console.log('📖 Ejemplo: node update-ngrok-url.js https://abc123-456-789.ngrok-free.app');
  process.exit(1);
}

const newNgrokUrl = args[0];

// Validar que la URL tenga el formato correcto
if (!newNgrokUrl.includes('ngrok-free.app') && !newNgrokUrl.includes('ngrok.io')) {
  console.error('❌ La URL no parece ser una URL válida de ngrok');
  process.exit(1);
}

// Actualizar vue.config.js
const vueConfigPath = path.join(__dirname, 'vue.config.js');
try {
  let vueConfig = fs.readFileSync(vueConfigPath, 'utf8');
  
  // Buscar y reemplazar la URL en la configuración del proxy
  const urlRegex = /target:\s*['"`]https:\/\/[^'"`]+['"`]/;
  vueConfig = vueConfig.replace(urlRegex, `target: '${newNgrokUrl}'`);
  
  fs.writeFileSync(vueConfigPath, vueConfig);
  console.log('✅ vue.config.js actualizado correctamente');
} catch (error) {
  console.error('❌ Error actualizando vue.config.js:', error.message);
}

// Actualizar src/config/api.js
const apiConfigPath = path.join(__dirname, 'src', 'config', 'api.js');
try {
  let apiConfig = fs.readFileSync(apiConfigPath, 'utf8');
  
  // Buscar y reemplazar la URL online
  const onlineUrlRegex = /ONLINE_URL:\s*['"`]https:\/\/[^'"`]+['"`]/;
  apiConfig = apiConfig.replace(onlineUrlRegex, `ONLINE_URL: '${newNgrokUrl}/api'`);
  
  fs.writeFileSync(apiConfigPath, apiConfig);
  console.log('✅ src/config/api.js actualizado correctamente');
} catch (error) {
  console.error('❌ Error actualizando src/config/api.js:', error.message);
}

console.log('🎉 URLs actualizadas exitosamente!');
console.log('🔄 Reinicia el servidor de desarrollo para aplicar los cambios');
console.log('💡 Comando: npm run serve');
