import { Router } from 'express';
import { getHealth, listAll, getOne, createOne, updateOne, deleteOne } from '../controllers/chemistry.controller.js';

const router = Router();
router.get('/basico/ejercicio-24', getHealth);
router.get('/api/chemistry/formulas', listAll);
router.get('/api/chemistry/formulas/:id', getOne);
router.post('/api/chemistry/formulas', createOne);
router.put('/api/chemistry/formulas/:id', updateOne);
router.delete('/api/chemistry/formulas/:id', deleteOne);

export default router;
