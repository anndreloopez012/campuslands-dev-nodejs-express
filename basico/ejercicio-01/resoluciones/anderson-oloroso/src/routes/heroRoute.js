const { Router } = require('express');
const heroController = require('../controllers/heroController');

const router = Router();

router.get('/', heroController.obtenerEstado);
router.post('/', heroController.checkHero);

module.exports = router;
