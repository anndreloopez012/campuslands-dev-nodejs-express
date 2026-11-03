const express = require('express');

const app = express();
const jobs = [];
let processing = false;
app.use(express.json());
const processNext = () => {
  if (processing) return;
  const job = jobs.find((item) => item.status === 'queued');
  if (!job) return;
  processing = true;
  job.status = 'processing';
  setTimeout(() => {
    job.status = 'completed';
    processing = false;
    processNext();
  }, 100);
};
app.post('/jobs', (req, res) => {
  if (typeof req.body?.task !== 'string' || !req.body.task.trim()) {
    return res.status(400).json({ error: 'La tarea es obligatoria' });
  }
  const job = { id: jobs.length + 1, task: req.body.task.trim(), status: 'queued' };
  jobs.push(job);
  res.status(202).json(job);
  processNext();
});
app.get('/jobs', (_req, res) => res.json(jobs));

module.exports = app;
