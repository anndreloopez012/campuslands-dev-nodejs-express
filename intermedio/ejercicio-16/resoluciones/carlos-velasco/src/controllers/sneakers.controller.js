const sneakersService = require('../services/sneakers.service');

function listarCatalogo(req, res) {
  // Ruta publica: vista limpia, sin stock interno
  res.status(200).json({ ok: true, data: sneakersService.listarVisible() });
}

function listarInventario(req, res) {
  // Ruta protegida (inventario o admin): stock completo visible
  res.status(200).json({
    ok: true,
    consultado_por: req.sesion.usuario,
    data: sneakersService.listarCompleto()
  });
}

function ajustarStock(req, res) {
  const resultado = sneakersService.ajustarStock(Number(req.params.id), req.body);
  if (resultado === null) {
    return res.status(404).json({ ok: false, message: 'Sneaker no encontrado' });
  }
  if (resultado.error) {
    return res.status(400).json({ ok: false, message: resultado.error });
  }
  return res.status(200).json({ ok: true, message: 'Stock actualizado', data: resultado.data });
}

module.exports = { listarCatalogo, listarInventario, ajustarStock };
