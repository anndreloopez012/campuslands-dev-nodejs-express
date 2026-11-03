import { json, readJson } from "../core/http.js";
import * as reagents from "../services/reagents.service.js";

function respond(res, result, successStatus = 200) {
    const { notFound, errors, conflict, reagent } = result;

    if (notFound) return json(res, 404, { ok: false, message: "Reactivo no encontrado" });
    if (errors) return json(res, 400, { ok: false, message: "Datos invalidos", errors });
    if (conflict) return json(res, 409, { ok: false, message: "Ya existe un reactivo con esa formula" });

    const headers = successStatus === 201 ? { Location: `/reagents/${reagent.id}` } : {};
    json(res, successStatus, { ok: true, data: reagent }, headers);
}

function index(req, res) {
    const data = reagents.list(req.query);
    json(res, 200, { ok: true, count: data.length, data });
}

function show(req, res) {
    const reagent = reagents.get(req.params.id);
    respond(res, reagent ? { reagent } : { notFound: true });
}

async function store(req, res) {
    respond(res, reagents.create(await readJson(req)), 201);
}

async function update(req, res) {
    respond(res, reagents.replace(req.params.id, await readJson(req)));
}

async function modify(req, res) {
    respond(res, reagents.patch(req.params.id, await readJson(req)));
}

function destroy(req, res) {
    if (!reagents.remove(req.params.id)) return json(res, 404, { ok: false, message: "Reactivo no encontrado" });
    res.writeHead(204).end();
}

export { index, show, store, update, modify, destroy };
