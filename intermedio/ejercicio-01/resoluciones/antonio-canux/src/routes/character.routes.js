import { Router } from 'express';
import { getCharacters, getCharacterById, createCharacter } from '../controllers/character.controller.js';

const router = Router();

router.get('/', getCharacters);
router.get('/:id', getCharacterById);
router.post('/', createCharacter);

export default router;