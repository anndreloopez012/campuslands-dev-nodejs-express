import express from 'express';

const app = express();
const players = [
  { id: 1, name: 'Ana', points: 18 },
  { id: 2, name: 'Luis', points: 24 },
  { id: 3, name: 'Mara', points: 15 }
];
app.get('/api/players', (request, response) => {
  const sort = request.query.sort ?? 'name';
  const order = request.query.order ?? 'asc';
  if (!['name', 'points'].includes(sort) || !['asc', 'desc'].includes(order)) {
    return response.status(400).json({ error: 'sort u order no válidos.' });
  }
  const direction = order === 'asc' ? 1 : -1;
  const data = [...players].sort((first, second) => {
    const comparison = typeof first[sort] === 'string'
      ? first[sort].localeCompare(second[sort])
      : first[sort] - second[sort];
    return comparison * direction;
  });
  return response.json({ data });
});
app.listen(process.env.PORT || 3000, () => console.log('API de ping-pong disponible en el puerto 3000'));
