import { parsearId } from "../utils/validar.js";
import * as motosService from "../services/motos.service.js";
import * as ordenesService from "../services/ordenes.service.js";

export function listar(req, res) {
    const { data, meta } = motosService.listar(req.query);
    res.json({ ok: true, meta, data });
}

export function ver(req, res) {
    res.json({ ok: true, data: motosService.buscar(parsearId(req.params.id, "de la moto")) });
}

export function crear(req, res) {
    const data = motosService.crear(req.body);
    res.status(201).location(`/api/motos/${data.id}`).json({ ok: true, data });
}

export function listarOrdenes(req, res) {
    const data = ordenesService.deLaMoto(parsearId(req.params.id, "de la moto"));
    res.json({ ok: true, total: data.length, data });
}

export function crearOrden(req, res) {
    const data = ordenesService.crear(parsearId(req.params.id, "de la moto"), req.body, req.usuario);
    res.status(201).location(`/api/ordenes/${data.id}`).json({ ok: true, data });
}
