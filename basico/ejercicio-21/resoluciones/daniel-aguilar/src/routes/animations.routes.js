const { Router } = require('express');
const controller = require('../controllers/animations.controller');

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.detail);
router.post('/', controller.create);

module.exports = router;
