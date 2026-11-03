const express = require('express');
const app = express();
app.use(express.json());
const jobs = [];
app.post('/jobs', (req, res) => {
  const motorcycle = req.body?.motorcycle;
  if (!motorcycle) return res.status(400).json({ error: 'Indica la moto' });
  const job = { id: jobs.length + 1, motorcycle, status: 'pendiente' };
  jobs.push(job);
  res.status(202).json(job);
});
app.get('/jobs', (req, res) => res.json(jobs));
app.listen(process.env.PORT || 3000);
