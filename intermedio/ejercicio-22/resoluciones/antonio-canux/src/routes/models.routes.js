import { Router } from 'express';
import { list, upload } from '../controllers/models.controller.js';

const router = Router();

router.get('/', list);
router.post('/', upload);

export default router;
