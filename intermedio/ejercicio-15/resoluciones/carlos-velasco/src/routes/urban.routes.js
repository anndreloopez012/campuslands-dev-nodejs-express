const { Router } = require('express');
const urbanService = require('../services/urban.service');

const router = Router();

// Publico: emite el JWT
router.post('/auth/login', (req, res, next) => {
  try {
    const token = urbanService.login(req.body.usuario, req.body.contrasena, req.body.cocina);
    return res.status(200).json({ ok: true, message: `Token valido por 60 minutos`, token_type: 'Bearer', data: { token } });
  } catch (error) {
    return next(error);
  }
});

// Publico: catalogo
router.get('/foodtrucks', urbanService.listarFoodTrucks);

// Protegido: exige JWT valido
router.get('/ordenes', urbanService.autenticarJwt, urbanService.listarOrdenes);
router.post('/ordenes', urbanService.autenticarJwt, urbanService.crearOrden);

module.exports = router;
