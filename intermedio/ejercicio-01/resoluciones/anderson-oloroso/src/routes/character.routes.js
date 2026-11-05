import { Router } from 'express';
import {
  getHealth,
  listCharacters,
  getCharacter,
  registerCharacter
} from '../controllers/character.controller.js';

const router = Router();

// Endpoint según README de entrega
router.get('/intermedio/ejercicio-01', getHealth);

// Endpoints REST temáticos
router.get('/api/rpg/characters', listCharacters);
router.get('/api/rpg/characters/:id', getCharacter);
router.post('/api/rpg/characters', registerCharacter);

export default router;
