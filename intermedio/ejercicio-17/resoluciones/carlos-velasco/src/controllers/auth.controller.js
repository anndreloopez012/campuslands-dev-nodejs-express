const travelService = require('../services/travel.service');

function login(req, res, next) {
  const resultado = travelService.login(req.body.usuario, req.body.contrasena);
  if (resultado.error) {
    return res.status(resultado.codigo).json({ ok: false, message: resultado.error });
  }
  return res.status(200).json({
    ok: true,
    message: 'Sesion iniciada',
    data: resultado.data,
    permisos_efectivos: resultado.data.rol  });
}

module.exports = { login };
