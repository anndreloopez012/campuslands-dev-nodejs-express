const hypercarService = require('../services/hypercar.service');
const { dataConId } = require('../middlewares/request.id');

function listarHiperdeportivos(req, res) {
  const data = hypercarService.listarHiperdeportivos();
  res.status(200).json(dataConId(res, { ok: true, data }));
}

function obtenerHiperdeportivo(req, res) {
  const hiper = hypercarService.obtenerHiperdeportivo(Number(req.params.id));
  if (!hiper) {
    return res.status(404).json(dataConId(res, { ok: false, message: 'Hiperdeportivo no encontrado' }));
  }
  return res.status(200).json(dataConId(res, { ok: true, data: hiper }));
}

function registrarHiperdeportivo(req, res) {
  const hiper = hypercarService.registrarHiperdeportivo(req.body);
  if (!hiper) {
    return res.status(400).json(dataConId(res, { ok: false, message: 'Datos del hiperdeportivo invalidos' }));
  }
  return res.status(201).json(dataConId(res, { ok: true, message: 'Hiperdeportivo registrado', data: hiper }));
}

module.exports = { listarHiperdeportivos, obtenerHiperdeportivo, registrarHiperdeportivo };
