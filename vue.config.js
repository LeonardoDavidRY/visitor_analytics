const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      // Proxy para la API online (ngrok)
      '/api/datos': {
        target: 'https://bdb48043244f.ngrok-free.app',
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
        target: 'http://10.119.2.148:8080',
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
