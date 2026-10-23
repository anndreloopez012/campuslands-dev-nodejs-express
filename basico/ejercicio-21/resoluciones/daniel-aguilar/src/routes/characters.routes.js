const { Router } = require('express');
const controller = require('../controllers/characters.controller');

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.detail);

module.exports = router;
