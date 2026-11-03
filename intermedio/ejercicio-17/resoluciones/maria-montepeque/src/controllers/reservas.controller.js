import * as reservasService from "../services/reservas.service.js";

function listReservas(req, res) {
    const data = reservasService.findVisibles(req.usuario);
    res.json({ ok: true, total: data.length, data });
}

function createReserva(req, res) {
    const nueva = reservasService.create(req.body, req.usuario);
    res.status(201).json({ ok: true, data: nueva });
}

function cancelarReserva(req, res) {
    reservasService.cancelar(Number(req.params.id), req.usuario);
    res.status(204).send();
}

export { listReservas, createReserva, cancelarReserva };
