import { Router } from 'express';

export function createWorkOrderRouter(workshop) {
  const router = Router();
  router.get('/', (request, response) => response.json(workshop.listWorkOrders(request.query.page, request.query.limit)));
  router.post('/', (request, response) => response.status(201).json({ data: workshop.createWorkOrder(request.body) }));
  router.patch('/:id/status', (request, response) => response.json({ data: workshop.updateWorkOrderStatus(request.params.id, request.body?.status) }));
  return router;
}
