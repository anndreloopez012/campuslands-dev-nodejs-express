import * as navesService from "../services/naves.service.js";

function listNaves(req, res) {
    const data = navesService.findAll();
    res.json({ ok: true, total: data.length, data });
}

function getNave(req, res) {
    const nave = navesService.findWithTripulantes(Number(req.params.id));
    res.json({ ok: true, data: nave });
}

function deleteNave(req, res) {
    navesService.remove(Number(req.params.id));
    res.status(204).send();
}

export { listNaves, getNave, deleteNave };
