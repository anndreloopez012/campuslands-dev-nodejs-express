const heroesService = require('../services/heroes.service');

function listarHeroes(req, res) {
  res.status(200).json({ ok: true, data: heroesService.listarHeroes() });
}

function obtenerHeroe(req, res) {
  const heroe = heroesService.obtenerHeroe(Number(req.params.id));
  if (!heroe) {
    return res.status(404).json({ ok: false, message: 'Heroe no encontrado' });
  }
  return res.status(200).json({ ok: true, data: heroe });
}

function crearHeroe(req, res) {
  try {
    const heroe = heroesService.crearHeroe(req.body);
    return res.status(201).json({ ok: true, message: 'Heroe creado', data: heroe });
  } catch (error) {
    return res.status(400).json({ ok: false, message: error.message });
  }
}

function eliminarHeroe(req, res) {
  const eliminado = heroesService.eliminarHeroe(Number(req.params.id));
  if (!eliminado) {
    return res.status(404).json({ ok: false, message: 'Heroe no encontrado' });
  }
  return res.status(200).json({ ok: true, message: 'Heroe eliminado' });
}

module.exports = { listarHeroes, obtenerHeroe, crearHeroe, eliminarHeroe };
