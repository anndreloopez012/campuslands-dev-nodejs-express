import { cotizar, PRECIOS } from "../services/cotizacion.service.js";
import * as trabajosService from "../services/trabajos.service.js";

function listPrecios(req, res) {
    res.json({ ok: true, data: PRECIOS });
}

function crearCotizacion(req, res) {
    const data = cotizar(req.body || {});
    res.json({ ok: true, data });
}

function listTrabajos(req, res) {
    const data = trabajosService.findAll(req.query.estado);
    res.json({ ok: true, total: data.length, data });
}

function getTrabajo(req, res) {
    const data = trabajosService.findById(Number(req.params.id));
    res.json({ ok: true, data });
}

function crearTrabajo(req, res) {
    const data = trabajosService.create(req.body);
    res.status(201).json({ ok: true, data });
}

function cambiarEstado(req, res) {
    const data = trabajosService.cambiarEstado(Number(req.params.id), req.body);
    res.json({ ok: true, data });
}

export { listPrecios, crearCotizacion, listTrabajos, getTrabajo, crearTrabajo, cambiarEstado };
