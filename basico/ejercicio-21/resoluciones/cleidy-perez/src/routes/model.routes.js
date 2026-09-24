const controller = require('../controllers/model.controller');
function handle(req, res) { const url = new URL(req.url, 'http://localhost'); const detail = url.pathname.match(/^\/api\/models\/([^/]+)$/); if (req.method === 'GET' && url.pathname === '/api/models') return controller.list(res); if (req.method === 'GET' && detail) return controller.show(detail[1], res); res.statusCode = 404; res.end(JSON.stringify({ ok: false, error: 'Ruta no encontrada' })); }
module.exports = { handle };
