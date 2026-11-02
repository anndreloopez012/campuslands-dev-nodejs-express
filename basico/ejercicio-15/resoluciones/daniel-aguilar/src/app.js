const http = require('node:http');
const { match } = require('./routes');
const { sendJson } = require('./utils/http');

function createApp() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const found = match(req.method, url.pathname);

      if (!found.handler) {
        if (found.allowed.length > 0) {
          return sendJson(res, 405, { ok: false, message: 'Metodo no permitido' }, { Allow: found.allowed.join(', ') });
        }
        return sendJson(res, 404, { ok: false, message: 'Ruta no encontrada' });
      }

      await found.handler(req, res, { params: found.params, query: url.searchParams });
    } catch (error) {
      const status = error.status || 500;
      if (status === 500) console.error(error);
      if (!res.headersSent) {
        sendJson(res, status, { ok: false, message: status === 500 ? 'Error interno del servidor' : error.message });
      }
    }
  });
}

module.exports = { createApp };
