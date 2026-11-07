const fleetService = require('../services/fleet.service');

function listarNaves(req, res) {
  res.status(200).json({ ok: true, data: fleetService.listarNaves() });
}

function crearNave(req, res, next) {
  try {
    const nave = fleetService.crearNave(req.body);
    return res.status(201).json({ ok: true, message: 'Nave registrada', data: nave });
  } catch (error) {
    return next(error);
  }
}

function eliminarNave(req, res, next) {
  try {
    const huerfanas = fleetService.eliminarNave(Number(req.params.id));
    return res.status(200).json({
      ok: true,
      message: `Nave eliminada (${huerfanas} mision(es) quedaron sin nave asignada)`
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarNaves, crearNave, eliminarNave };
