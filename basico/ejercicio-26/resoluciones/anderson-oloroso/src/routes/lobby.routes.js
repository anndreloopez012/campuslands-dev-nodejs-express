import { Router } from 'express';
import { getHealth, listLobbies, createLobby, joinPlayer, removeLobby } from '../controllers/lobby.controller.js';

const router = Router();
router.get('/basico/ejercicio-26', getHealth);
router.get('/api/shooters/lobbies', listLobbies);
router.post('/api/shooters/lobbies', createLobby);
router.post('/api/shooters/lobbies/:id/join', joinPlayer);
router.delete('/api/shooters/lobbies/:id', removeLobby);

export default router;
