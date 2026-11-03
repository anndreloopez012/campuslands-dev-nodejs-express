const express = require('express');

const environment = process.env.NODE_ENV || 'development';
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT debe ser un número entre 1 y 65535');
}

const app = express();
app.get('/config', (_req, res) => res.json({ environment, port }));
app.listen(port, () => console.log(`MOBA API en http://localhost:${port}`));
