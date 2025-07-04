const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'https://bc25-186-69-112-160.ngrok-free.app',
        changeOrigin: true,
        secure: true,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        onProxyReq: function(proxyReq, req, res) {
          proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
        }
      }
    }
  }
});
