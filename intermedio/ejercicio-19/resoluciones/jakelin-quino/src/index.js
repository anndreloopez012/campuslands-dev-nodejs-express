require('dotenv').config();
const express = require('express');

const app = express();
const port = Number(process.env.PORT) || 3000;
app.get('/config', (_req, res) => res.json({ port }));
app.listen(port, () => console.log(`API en http://localhost:${port}`));
