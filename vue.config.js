const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api/datos': {
        target: 'https://8082-34-150-208-222.ngrok-free.app',
        changeOrigin: true,
        secure: true,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        onProxyReq: function(proxyReq, req, res) {
          proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
        }
      },
      '/api/detecciones': {
        target: 'http://192.168.232.129:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
