import express from 'express';

const app = express();
const ships = [{ id: 1, name: 'Aurora' }, { id: 2, name: 'Horizonte' }];
const crew = [{ id: 1, name: 'Iris', shipId: 1 }, { id: 2, name: 'Leo', shipId: 1 }, { id: 3, name: 'Vega', shipId: 2 }];
app.get('/api/ships/:shipId/crew', (request, response) => {
  const shipId = Number(request.params.shipId);
  const ship = ships.find((item) => item.id === shipId);
  if (!ship) return response.status(404).json({ error: 'Nave no encontrada.' });
  return response.json({ ship, data: crew.filter((member) => member.shipId === shipId) });
});
app.listen(process.env.PORT || 3000, () => console.log('API espacial disponible en el puerto 3000'));
