const travelService = require('../services/travel.service');
const { puede } = require('../auth/permisos');

function listarPaquetes(req, res) {
  res.status(200).json({ ok: true, data: travelService.listarPaquetes() });
}

function listarReservas(req, res) {
  const verTodas = puede(req.sesion.rol, 'reservas:ver-todas');
  const resultado = travelService.listarReservas(req.sesion, verTodas);
  res.status(200).json({
    ok: true,
    visto_como: verTodas ? 'todas' : 'propias',
    data: resultado.data
  });
}

function crearReserva(req, res) {
  const resultado = travelService.crearReserva(req.sesion, Number(req.body.paqueteId));
  if (resultado.error) {
    return res.status(resultado.codigo).json({ ok: false, message: resultado.error });
  }
  return res.status(201).json({ ok: true, message: 'Reserva confirmada', data: resultado.data });
}

function cancelarReserva(req, res) {
  const puedeCualquiera = puede(req.sesion.rol, 'reservas:cancelar-cualquiera');
  const resultado = travelService.cancelarReserva(req.sesion, Number(req.params.id), puedeCualquiera);
  if (resultado.error) {
    return res.status(resultado.codigo).json({ ok: false, message: resultado.error });
  }
  return res.status(200).json({ ok: true, message: 'Reserva cancelada (cupo devuelto)', data: resultado.data });
}

module.exports = { listarPaquetes, listarReservas, crearReserva, cancelarReserva };
