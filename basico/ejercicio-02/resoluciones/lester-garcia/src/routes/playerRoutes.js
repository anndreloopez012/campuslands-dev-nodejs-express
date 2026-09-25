import express from 'express';
//  Recuerda incluir el .js al importar archivos locales
import { getPlayerStats, registerMatch } from '../controllers/playerController.js'; 

const router = express.Router();

router.get('/:id', getPlayerStats);
router.post('/match', registerMatch);

export default router; // Exportación por defecto
