import { json } from "../core/http.js";
import { listRigs, findRig } from "../services/rigs.service.js";

function getRigs(req, res) {
    const data = listRigs(req.query);
    json(res, 200, { ok: true, count: data.length, data });
}

function getRig(req, res) {
    const rig = findRig(req.params.id);
    if (!rig) return json(res, 404, { ok: false, message: `No existe el rig ${req.params.id}` });

    json(res, 200, { ok: true, data: rig });
}

export { getRigs, getRig };
