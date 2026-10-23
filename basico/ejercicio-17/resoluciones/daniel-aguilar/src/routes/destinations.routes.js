const { Router } = require('express');
const controller = require('../controllers/destinations.controller');

const router = Router();

router.get('/', controller.list);
// IMPORTANTE: '/featured' va ANTES de '/:id'; si no, Express leeria "featured" como un id.
router.get('/featured', controller.featured);
router.get('/:id', controller.detail);

module.exports = router;
