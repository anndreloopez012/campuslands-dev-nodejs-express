const footballService = require('../services/football.service');

function listarEquipos(req, res) {
  res.status(200).json({ ok: true, data: footballService.listarEquipos({ ciudad: req.query.ciudad }) });
}

function crearEquipo(req, res, next) {
  try {
    const equipo = footballService.crearEquipo(req.body);
    return res.status(201).set('Location', `/equipos/${equipo.id}`).json({ ok: true, message: 'Equipo creado', data: equipo });
  } catch (error) {
    return next(error);
  }
}

function listarPlantilla(req, res, next) {
  try {
    const resultado = footballService.listarPlantilla(Number(req.params.id));
    return res.status(200).json({ ok: true, data: resultado });
  } catch (error) {
    return next(error);
  }
}

function crearJugador(req, res, next) {
  try {
    const jugador = footballService.crearJugador(Number(req.params.id), req.body);
    return res.status(201).json({ ok: true, message: 'Jugador fichado', data: jugador });
  } catch (error) {
    return next(error);
  }
}

function borrarEquipo(req, res, next) {
  try {
    const resultado = footballService.borrarEquipo(Number(req.params.id));
    return res.status(200).json({ ok: true, message: 'Equipo disuelto', data: resultado });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarEquipos, crearEquipo, listarPlantilla, crearJugador, borrarEquipo };
