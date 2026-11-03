const express = require('express');
const app = express();
app.get('/openapi.json', (req, res) => res.json({
  openapi: '3.0.0',
  info: { title: 'API de formulas', version: '1.0.0' },
  paths: { '/formulas': { get: { summary: 'Lista formulas quimicas' } } }
}));
app.listen(process.env.PORT || 3000);
