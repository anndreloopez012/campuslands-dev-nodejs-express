import { Router } from 'express';

export function createMatchRoutes(service) {
  const router = Router();
  router.get('/', (request, response) => response.json({ data: service.list() }));
  router.post('/', (request, response) => {
    const result = service.create(request.body);
    if (result.error) return response.status(400).json({ error: result.error });
    return response.status(201).json({ data: result.data });
  });
  return router;
}
