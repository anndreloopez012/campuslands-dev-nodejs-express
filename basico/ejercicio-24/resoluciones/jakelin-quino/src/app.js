const http = require('node:http');
const formulaRoutes = require('./routes/formulas.routes');
const { sendJson } = require('./http');

const app = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (await formulaRoutes(request, response, url)) return;
  sendJson(response, 404, { ok: false, error: 'Ruta no encontrada' });
});

module.exports = app;