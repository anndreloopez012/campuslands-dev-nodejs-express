const express = require('express');

const app = express();
const events = [];
app.use(express.json());
app.post('/webhooks', (req, res) => {
  if (!req.body?.event || !req.body?.project) {
    return res.status(400).json({ error: 'Envía el evento y el proyecto' });
  }
  const event = { received: true, event: req.body.event, project: req.body.project };
  events.push(event);
  res.status(202).json(event);
});
app.get('/webhooks', (_req, res) => res.json(events));
app.listen(3000, () => console.log('Webhooks API en http://localhost:3000'));
