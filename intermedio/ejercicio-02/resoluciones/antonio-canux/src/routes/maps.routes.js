import { Router } from 'express';
import { listMaps, getMapById } from '../controllers/maps.controller.js';

const router = Router();

router.get('/', listMaps);
router.get('/:id', getMapById);

export default router;
