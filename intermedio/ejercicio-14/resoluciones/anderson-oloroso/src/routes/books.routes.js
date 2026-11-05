import { Router } from 'express';
import { getHealth, listBooks, createBook } from '../controllers/books.controller.js';
import { mockAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
router.get('/intermedio/ejercicio-14', getHealth);
router.get('/api/books/catalog', listBooks); // Público
router.post('/api/books/catalog', mockAuthMiddleware, createBook); // Protegido

export default router;
