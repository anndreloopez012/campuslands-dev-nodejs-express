const { Router } = require('express');
const renderController = require('../controllers/render.controller');
const { crearRateLimiter } = require('../middlewares/rate.limiter');

const router = Router();

// Solo los endpoints costosos (encolar render) llevan limite estricto
const limiteRender = crearRateLimiter({ maximo: 5, ventanaMs: 10000 });

router.get('/renders', renderController.listarRenders);
router.get('/renders/:id', renderController.consultarRend);
router.post('/renders', limiteRender, renderController.encolarRend);

module.exports = router;
