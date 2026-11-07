const { Router } = require('express');
const diveService = require('../services/dive.service');

const router = Router();

router.get('/saltadores', (req, res) => {
  res.status(200).json({ ok: true, data: diveService.listarSaltadores() });
});

router.post('/saltadores/registro', (req, res, next) => {
  try {
    const saltador = diveService.registrar(req.body);
    return res.status(201).json({ ok: true, message: 'Saltador registrado (hash scrypt almacenado)', data: saltador });
  } catch (error) {
    return next(error);
  }
});

router.post('/auth/login', (req, res, next) => {
  try {
    const saltador = diveService.login(req.body.nombre, req.body.contrasena);
    return res.status(200).json({ ok: true, message: 'Login correcto (scrypt verificado en tiempo constante)', data: saltador });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
