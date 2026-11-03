import { parsearId } from "../utils/validar.js";
import * as repuestosService from "../services/repuestos.service.js";

export function listar(req, res) {
    const data = repuestosService.listar(req.query);
    res.json({ ok: true, total: data.length, data });
}

export function cambiarStock(req, res) {
    res.json({ ok: true, data: repuestosService.cambiarStock(parsearId(req.params.id, "del repuesto"), req.body) });
}
