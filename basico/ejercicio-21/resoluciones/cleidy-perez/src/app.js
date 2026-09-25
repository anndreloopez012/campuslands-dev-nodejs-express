const http = require('node:http');
const routes = require('./routes/model.routes');
function createServer() { return http.createServer((req, res) => { res.setHeader('content-type', 'application/json; charset=utf-8'); routes.handle(req, res); }); }
function start(port = Number(process.env.PORT || 3000)) { const server = createServer(); server.listen(port, () => console.log(`API de modelos en http://localhost:${port}`)); return server; }
if (require.main === module) start();
module.exports = { createServer, start };
