const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    proxy({ target: 'http://localhost:8083', changeOrigin: true })
  );

  app.use(
    '/socket.io',
    proxy({
      target: 'http://localhost:8083',
      changeOrigin: true,
      websocket: true
    })
  );
};
