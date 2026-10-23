const { Router } = require('express');
const controller = require('../controllers/books.controller');

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, status: 'up' }));
router.get('/basico/ejercicio-14', controller.info);
router.get('/books', controller.list);
router.get('/books/:id', controller.detail);
router.post('/books', controller.create);

module.exports = router;
