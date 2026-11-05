import { Router } from 'express';
import { MissionService } from '../services/mission-service.js';

export function createMissionRouter(service = new MissionService()) {
  const router = Router();
  router.get('/', (request, response) => {
    const missions = service.list(request.query.status);
    response.json({ data: missions });
  });
  router.post('/', (request, response) => {
    const result = service.create(request.body);
    if (result.error) return response.status(400).json({ error: result.error });
    return response.status(201).json({ data: result.data });
  });
  router.patch('/:id/complete', (request, response) => {
    const result = service.complete(request.params.id);
    if (result.error === 'NOT_FOUND') return response.status(404).json({ error: 'Misión no encontrada' });
    if (result.error) return response.status(409).json({ error: 'La misión ya está completada' });
    return response.json({ data: result.data });
  });
  return router;
}
