const express = require('express');

const app = express();
const job = { name: 'Revisar trabajos pendientes', runs: 0, lastRun: null };
const runJob = () => {
  job.runs += 1;
  job.lastRun = new Date().toISOString();
  console.log(`Job ejecutado: ${job.lastRun}`);
};
setInterval(runJob, 5000);
app.get('/jobs', (_req, res) => res.json(job));
app.listen(3000, () => console.log('Soldadura API en http://localhost:3000'));
