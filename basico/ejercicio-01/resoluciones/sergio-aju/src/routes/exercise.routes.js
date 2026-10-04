import { Router } from 'express';
import { getExerciseInfo } from '../controllers/exercise.controller.js';

const router = Router();

router.get('/health', getExerciseInfo);

export default router;