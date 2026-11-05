import { Router } from 'express';

export function createMatchRouter(store) {
  const router = Router();
  router.get('/', (request, response) => response.json({ data: store.list(request.query.map) }));
  router.get('/:id', (request, response) => {
    const match = store.find(request.params.id);
    return match ? response.json({ data: match }) : response.status(404).json({ error: 'Partida no encontrada' });
  });
  router.post('/', (request, response) => {
    const { map, players, winner } = request.body ?? {};
    if (typeof map !== 'string' || !map.trim() || !Array.isArray(players) || players.length < 2 || players.some((player) => typeof player !== 'string' || !player.trim()) || !players.includes(winner)) {
      return response.status(400).json({ error: 'Se requiere mapa, al menos dos jugadores y un ganador presente en la lista' });
    }
    return response.status(201).json({ data: store.create({ map: map.trim(), players: players.map((player) => player.trim()), winner }) });
  });
  return router;
}
