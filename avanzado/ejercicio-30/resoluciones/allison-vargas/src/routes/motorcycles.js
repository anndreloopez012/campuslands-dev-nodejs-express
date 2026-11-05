import { Router } from 'express';

export function createMotorcycleRouter(workshop) {
  const router = Router();
  router.get('/', (request, response) => response.json(workshop.listMotorcycles(request.query.page, request.query.limit)));
  router.post('/', (request, response) => response.status(201).json({ data: workshop.createMotorcycle(request.body) }));
  return router;
}
