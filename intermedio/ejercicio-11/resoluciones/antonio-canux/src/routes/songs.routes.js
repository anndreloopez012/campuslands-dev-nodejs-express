import { Router } from 'express';
import { search } from '../controllers/songs.controller.js';

const router = Router();

router.get('/', search);

export default router;
