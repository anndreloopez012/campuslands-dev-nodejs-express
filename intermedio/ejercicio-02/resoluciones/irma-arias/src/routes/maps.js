import { Router } from 'express';

const router = Router();
const maps = [{ id: 1, name: 'Puerto' }, { id: 2, name: 'Laboratorio' }];
router.get('/', (_request, response) => response.json({ data: maps }));

export default router;
