const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      // Proxy para la API online (ngrok)
      '/api/datos': {
        target: 'https://cc25-34-23-145-148.ngrok-free.app',
        changeOrigin: true,
        secure: true,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        onProxyReq: function(proxyReq, req, res) {
          proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
        }
      },
      // Proxy para la API local (detecciones y timestamps)
      '/api/detecciones': {
        target: 'http://192.168.45.129:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug',
        onProxyReq: function(proxyReq, req, res) {
          console.log(`[PROXY] ${req.method} ${req.url} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
        },
        onError: function(err, req, res) {
          console.log('[PROXY ERROR]', err.message);
        }
      }
    }
  }
});
