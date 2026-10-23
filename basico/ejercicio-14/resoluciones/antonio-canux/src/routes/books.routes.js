import { Router } from 'express';
import { getStatus, getBooks, createBook } from '../controllers/books.controller.js';

const router = Router();
router.get('/', getStatus);
router.get('/books', getBooks);
router.post('/books', createBook);

export default router;
