import { json, readJson } from "../core/http.js";
import * as service from "../services/electrodes.service.js";

function getElectrodes(req, res) {
    const data = service.listElectrodes(req.query);
    json(res, 200, { ok: true, count: data.length, data });
}

function getElectrode(req, res) {
    const electrode = service.getElectrode(req.params.id);
    if (!electrode) return json(res, 404, { ok: false, message: `No existe el electrodo ${req.params.id}` });

    json(res, 200, { ok: true, data: electrode });
}

async function postElectrode(req, res) {
    const body = await readJson(req);
    const { errors, conflict, electrode } = service.createElectrode(body);

    if (errors) return json(res, 400, { ok: false, message: "Electrodo invalido", errors });
    if (conflict) return json(res, 409, { ok: false, message: "Ya existe un electrodo con ese code y diametro" });

    json(res, 201, { ok: true, data: electrode });
}

async function patchStock(req, res) {
    const { delta } = await readJson(req);
    const { notFound, errors, electrode } = service.adjustStock(req.params.id, delta);

    if (notFound) return json(res, 404, { ok: false, message: `No existe el electrodo ${req.params.id}` });
    if (errors) return json(res, 400, { ok: false, message: "Ajuste invalido", errors });

    json(res, 200, { ok: true, data: electrode });
}

function deleteElectrode(req, res) {
    const removed = service.deleteElectrode(req.params.id);
    if (!removed) return json(res, 404, { ok: false, message: `No existe el electrodo ${req.params.id}` });

    res.writeHead(204).end();
}

function getStats(req, res) {
    json(res, 200, { ok: true, data: service.getStats() });
}

function postReset(req, res) {
    const items = service.resetElectrodes();
    json(res, 200, { ok: true, message: `Inventario restaurado con ${items} electrodos semilla` });
}

export { getElectrodes, getElectrode, postElectrode, patchStock, deleteElectrode, getStats, postReset };
