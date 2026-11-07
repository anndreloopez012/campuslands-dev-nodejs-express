const canvasService = require('../services/canvas.service');

function listarLienzos(req, res) {
  res.status(200).json({ ok: true, data: canvasService.listarLienzos() });
}

function crearLienzo(req, res, next) {
  try {
    const lienzo = canvasService.crearLienzo(req.body);
    return res.status(201).json({ ok: true, message: 'Lienzo creado', data: lienzo });
  } catch (error) {
    return next(error);
  }
}

function actualizarTitulo(req, res, next) {
  try {
    const lienzo = canvasService.actualizarTitulo(Number(req.params.id), req.body);
    return res.status(200).json({ ok: true, message: 'Titulo actualizado', data: lienzo });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarLienzos, crearLienzo, actualizarTitulo };
