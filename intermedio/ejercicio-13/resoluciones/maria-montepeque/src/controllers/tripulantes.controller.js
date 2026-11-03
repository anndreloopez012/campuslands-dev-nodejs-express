import * as tripulantesService from "../services/tripulantes.service.js";

function listTripulantes(req, res) {
    const data = tripulantesService.findAll();
    res.json({ ok: true, total: data.length, data });
}

function getTripulante(req, res) {
    const tripulante = tripulantesService.findById(Number(req.params.id));
    res.json({ ok: true, data: tripulante });
}

function createTripulante(req, res) {
    const nuevo = tripulantesService.create(req.body);
    res.status(201).json({ ok: true, data: nuevo });
}

function deleteTripulante(req, res) {
    tripulantesService.remove(Number(req.params.id));
    res.status(204).send();
}

export { listTripulantes, getTripulante, createTripulante, deleteTripulante };
