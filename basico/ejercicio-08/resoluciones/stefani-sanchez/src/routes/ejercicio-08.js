import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
    res.json({ ok: true, exercise: 'ejercicio-08', author: 'stefani-sanchez' });
});

export default router;
