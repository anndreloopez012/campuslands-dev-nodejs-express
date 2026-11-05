import { Router } from 'express';
import { listAgents, createAgent } from '../controllers/agents.controller.js';

const router = Router();

router.get('/', listAgents);
router.post('/', createAgent);

export default router;
