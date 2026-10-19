import { Router } from 'express';

const router = Router();
const teams = [{ id: 1, name: 'Centinelas' }, { id: 2, name: 'Vanguardia' }];
router.get('/', (_request, response) => response.json({ data: teams }));

export default router;
