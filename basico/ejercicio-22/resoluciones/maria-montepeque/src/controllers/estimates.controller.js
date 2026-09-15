import { json, readJson } from "../core/http.js";
import { estimateRoom } from "../services/estimate.service.js";
import { toModelMillimeters } from "../services/scale.service.js";
import { catalog } from "../services/materials.service.js";

async function postEstimate(req, res) {
    const body = await readJson(req);
    const estimate = estimateRoom(body);
    json(res, 200, { ok: true, data: estimate });
}

function getScale(req, res) {
    const { meters, scale } = req.query;
    const result = toModelMillimeters(Number(meters), scale);
    json(res, 200, { ok: true, data: result });
}

function getCatalog(req, res) {
    json(res, 200, { ok: true, data: catalog });
}

export { postEstimate, getScale, getCatalog };
