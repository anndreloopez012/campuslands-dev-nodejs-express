const http = require('node:http');
const sceneRoutes = require('./routes/scenes.routes');
const { sendJson } = require('./http');

const app = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (sceneRoutes(request, response, url)) return;
  sendJson(response, 404, { ok: false, error: 'Ruta no encontrada' });
});

module.exports = app;