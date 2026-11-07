const tallerService = require('../services/taller.service');

function listarMotos(req, res) {
  res.status(200).json({ ok: true, data: tallerService.listarMotos() });
}

function obtenerMoto(req, res, next) {
  try {
    return res.status(200).json({ ok: true, data: tallerService.obtenerMoto(Number(req.params.id)) });
  } catch (error) {
    return next(error);
  }
}

function registrarMoto(req, res, next) {
  try {
    const moto = tallerService.registrarMoto(req.body);
    return res.status(201).json({ ok: true, message: 'Moto registrada', data: moto });
  } catch (error) {
    return next(error);
  }
}

function abrirOrden(req, res, next) {
  try {
    const orden = tallerService.abrirOrden(req.body);
    return res.status(201).json({ ok: true, message: 'Orden de trabajo abierta', data: orden });
  } catch (error) {
    return next(error);
  }
}

function listarOrdenes(req, res) {
  res.status(200).json({ ok: true, data: tallerService.listarOrdenes() });
}

function cambiarEstado(req, res, next) {
  try {
    const orden = tallerService.cambiarEstado(Number(req.params.id), req.body.estado);
    return res.status(200).json({ ok: true, message: `Estado actualizado a "${orden.estado}"`, data: orden });
  } catch (error) {
    return next(error);
  }
}

function listarRepuestos(req, res) {
  res.status(200).json({ ok: true, data: tallerService.listarRepuestos() });
}

function moverStock(req, res, next) {
  try {
    const movimiento = tallerService.moverStock(Number(req.params.id), req.body);
    return res.status(200).json({ ok: true, message: 'Movimiento de inventario aplicado', data: movimiento });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarMotos, obtenerMoto, registrarMoto, abrirOrden, listarOrdenes, cambiarEstado, listarRepuestos, moverStock };
