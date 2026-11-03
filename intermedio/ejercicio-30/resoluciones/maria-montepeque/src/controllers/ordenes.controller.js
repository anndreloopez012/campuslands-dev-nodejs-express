import { parsearId } from "../utils/validar.js";
import * as ordenesService from "../services/ordenes.service.js";

const idOrden = (req) => parsearId(req.params.id, "de la orden");

export function listar(req, res) {
    const { data, meta } = ordenesService.listar(req.query, req.usuario);
    res.json({ ok: true, meta, data });
}

export function ver(req, res) {
    res.json({ ok: true, data: ordenesService.ver(idOrden(req), req.usuario) });
}

export function asignar(req, res) {
    res.json({ ok: true, data: ordenesService.asignar(idOrden(req), req.body) });
}

export function cambiarEstado(req, res) {
    res.json({ ok: true, data: ordenesService.cambiarEstado(idOrden(req), req.body, req.usuario) });
}

export function agregarRepuesto(req, res) {
    res.status(201).json({ ok: true, data: ordenesService.agregarRepuesto(idOrden(req), req.body, req.usuario) });
}
