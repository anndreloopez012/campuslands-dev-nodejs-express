const express = require('express');

const app = express();
let queue = Promise.resolve();
let nextTurn = 1;
app.use(express.json());
app.post('/renders', async (req, res) => {
  if (typeof req.body?.scene !== 'string' || !req.body.scene.trim()) {
    return res.status(400).json({ error: 'La escena es obligatoria' });
  }
  const scene = req.body.scene.trim();
  const job = queue.then(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { scene, turn: nextTurn++, status: 'completed' };
  });
  queue = job.then(() => undefined);
  res.json(await job);
});
app.listen(3000, () => console.log('Render API en http://localhost:3000'));
