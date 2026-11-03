import * as campeones from "../services/campeones.service.js";
import * as partidas from "../services/partidas.service.js";
import { comoJsonSchema, SCHEMAS_PUBLICOS } from "../schemas/index.js";
import AppError from "../shared/app-error.js";

// los controllers ya no validan nada: leen req.datos que dejo el middleware

export function listarCampeones(req, res) {
    const { data, meta } = campeones.listar(req.datos.query);
    res.json({ ok: true, meta, data });
}

export function verCampeon(req, res) {
    res.json({ ok: true, data: campeones.buscar(req.datos.params.id) });
}

export function crearCampeon(req, res) {
    const data = campeones.crear(req.datos.body);
    res.status(201).location(`/api/campeones/${data.id}`).json({ ok: true, data });
}

export function editarCampeon(req, res) {
    res.json({ ok: true, data: campeones.editar(req.datos.params.id, req.datos.body) });
}

export function registrarPartida(req, res) {
    const data = partidas.registrar(req.datos.body);
    res.status(201).location(`/api/partidas/${data.id}`).json({ ok: true, data });
}

export function verPartida(req, res) {
    res.json({ ok: true, data: partidas.buscar(req.datos.params.id) });
}

export function listarSchemas(req, res) {
    res.json({ ok: true, data: Object.keys(SCHEMAS_PUBLICOS).map((n) => `/api/schemas/${n}`) });
}

export function verSchema(req, res) {
    const schema = comoJsonSchema(req.params.nombre);
    if (!schema) {
        throw new AppError(404, `No hay un schema llamado ${req.params.nombre}`);
    }
    res.json(schema);
}
