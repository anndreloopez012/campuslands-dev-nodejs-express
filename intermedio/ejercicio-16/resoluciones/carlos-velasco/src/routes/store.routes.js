const { Router } = require('express');
const sneakersController = require('../controllers/sneakers.controller');
const sessionService = require('../services/session.service');
const { requireAuth, requireRole, logoutHandler } = require('../middlewares/auth.guard');

const router = Router();

// Publico
router.post('/auth/login', (req, res, next) => {
  try {
    const sesion = sessionService.login(req.body.usuario, req.body.contrasena);
    return res.status(200).json({ ok: true, message: 'Sesion iniciada', data: sesion });
  } catch (error) {
    return next(error);
  }
});
router.post('/auth/logout', logoutHandler);
router.get('/catalogo', sneakersController.listarCatalogo);

// Protegido: cualquier usuario autenticado
router.get('/inventario', requireAuth, sneakersController.listarInventario);

// Protegido por rol: verificacion compuesta requireAuth + requireRole
router.post(
  '/inventario/:id/stock',
  requireAuth,
  requireRole('inventario', 'admin'),
  sneakersController.ajustarStock
);

module.exports = router;
