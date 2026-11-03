const express = require('express');
const app = express();
app.get('/health', (req, res) => res.json({ status: 'healthy' }));
app.get('/ready', (req, res) => res.json({ status: 'ready', service: 'futbol' }));
app.listen(process.env.PORT || 3000, '0.0.0.0');
