const { Router } = require('express');
const fightersController = require('../controllers/fighters.controller');

const router = Router();

router.get('/fighters', fightersController.listarPeleadores);

module.exports = router;
