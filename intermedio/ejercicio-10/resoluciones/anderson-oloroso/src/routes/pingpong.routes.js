import { Router } from 'express';
import { getHealth, listPlayers } from '../controllers/pingpong.controller.js';

const router = Router();

// Endpoint de verificación del README base
router.get('/intermedio/ejercicio-10', getHealth);

// Endpoints Ranking Tenis de Mesa
router.get('/api/pingpong/players', listPlayers);

export default router;
