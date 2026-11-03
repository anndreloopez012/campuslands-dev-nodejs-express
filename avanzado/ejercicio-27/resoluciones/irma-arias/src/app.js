const express = require('express');
const app = express();
const config = { port: Number(process.env.PORT) || 3000, region: process.env.MOBA_REGION || 'latam' };
app.get('/config', (req, res) => res.json({ region: config.region }));
app.listen(config.port, () => console.log(`API lista en puerto ${config.port}`));
