const http = require('node:http');
const products = [{ id: 1, name: 'Sneaker Aurora', category: 'sneakers', price: 899 }, { id: 2, name: 'Chaqueta North', category: 'ropa', price: 1250 }, { id: 3, name: 'Gorra Studio', category: 'ropa', price: 320 }];
function sendJson(res, status, data) { const body = JSON.stringify(data); res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(body) }); res.end(body); }
function createServer() { return http.createServer((req, res) => { const url = new URL(req.url, 'http://localhost'); if (req.method === 'GET' && url.pathname === '/health') return sendJson(res, 200, { ok: true, message: 'servidor activo' }); if (req.method === 'GET' && url.pathname === '/api/products') { const category = url.searchParams.get('category'); return sendJson(res, 200, { ok: true, data: category ? products.filter((item) => item.category === category) : products }); } return sendJson(res, 404, { ok: false, error: 'Recurso no encontrado' }); }); }
function start(port = Number(process.env.PORT || 3000)) { const server = createServer(); server.listen(port, () => console.log(`Servidor nativo en http://localhost:${port}`)); return server; }
if (require.main === module) start();
module.exports = { products, sendJson, createServer, start };
