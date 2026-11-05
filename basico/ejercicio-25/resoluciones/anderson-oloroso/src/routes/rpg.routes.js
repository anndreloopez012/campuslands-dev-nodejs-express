import { Router } from 'express';
import { getHealth, listItems, getItem, createItem } from '../controllers/rpg.controller.js';

const router = Router();
router.get('/basico/ejercicio-25', getHealth);
router.get('/api/rpg/inventory', listItems);
router.get('/api/rpg/inventory/:id', getItem);
router.post('/api/rpg/inventory', createItem);

export default router;
