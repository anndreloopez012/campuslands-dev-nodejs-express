import { json, readJson } from "../core/http.js";
import { listRenders, findRender, createRender } from "../services/renders.service.js";

function getRenders(req, res) {
    const data = listRenders();
    json(res, 200, { ok: true, count: data.length, data });
}

function getRender(req, res) {
    const render = findRender(req.params.id);
    if (!render) return json(res, 404, { ok: false, message: `No existe el render ${req.params.id}` });

    json(res, 200, { ok: true, data: render });
}

async function postRender(req, res) {
    const body = await readJson(req);
    const { errors, render } = createRender(body);

    if (errors) return json(res, 400, { ok: false, message: "Render invalido", errors });

    json(res, 201, { ok: true, data: render });
}

export { getRenders, getRender, postRender };
