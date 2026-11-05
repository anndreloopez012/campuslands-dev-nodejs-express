import { Router } from 'express';
import { getHealth, listJobs, addJob } from '../controllers/welding.controller.js';

const router = Router();
router.get('/basico/ejercicio-23', getHealth);
router.get('/api/welding/jobs', listJobs);
router.post('/api/welding/jobs', addJob);

export default router;
