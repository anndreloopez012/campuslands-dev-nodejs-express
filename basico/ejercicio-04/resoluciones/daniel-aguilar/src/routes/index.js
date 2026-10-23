import express from 'express';
import { info, list, detail } from '../controllers/maps.controller.js';

// Export por defecto: se importa sin llaves y con el nombre que quieras
const router = express.Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-04', info);
router.get('/maps', list);
router.get('/maps/:id', detail);

export default router;
