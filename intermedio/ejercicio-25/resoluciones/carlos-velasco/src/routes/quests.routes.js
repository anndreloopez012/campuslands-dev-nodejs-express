const { Router } = require('express');
const questController = require('../controllers/quest.controller');
const questService = require('../services/quest.service');

const router = Router();

router.get('/heroes', (req, res) => {
  res.status(200).json({ ok: true, data: questService.listarHeroes() });
});
router.get('/heroes/:id', (req, res, next) => {
  try {
    return res.status(200).json({ ok: true, data: questService.obtenerHeroe(Number(req.params.id)) });
  } catch (error) {
    return next(error);
  }
});

router.get('/misiones', questController.listarMisiones);
router.post('/misiones', questController.crearMision);
router.post('/misiones/:id/asignar', questController.asignarMision);

module.exports = router;
