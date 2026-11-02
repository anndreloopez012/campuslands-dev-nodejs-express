import { Router } from 'express';
import { listAuthors, getAuthor, getBook } from '../controllers/scifi.controller.js';

const router = Router();

router.get('/authors', listAuthors);
router.get('/authors/:id', getAuthor);
router.get('/books/:id', getBook);

export default router;
