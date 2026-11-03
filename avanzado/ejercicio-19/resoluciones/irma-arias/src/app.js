const express = require('express');
const app = express();
app.use(express.json());
const audit = [];
app.post('/tattoos', (req, res) => {
  const action = { design: req.body?.design, at: new Date().toISOString() };
  audit.push(action);
  res.status(201).json(action);
});
app.get('/audit', (req, res) => res.json(audit));
app.listen(process.env.PORT || 3000);
