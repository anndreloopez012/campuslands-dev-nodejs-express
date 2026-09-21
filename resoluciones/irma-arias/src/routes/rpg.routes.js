
const { Router } = require('express');
const { getEstado } = require('../controllers/rpg.controller');

const router = Router();
router.get('/', getEstado);

module.exports = router;