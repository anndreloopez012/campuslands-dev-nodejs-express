import * as toursService from "../services/tours.service.js";

function listTours(req, res) {
    const data = toursService.findAll();
    res.json({ ok: true, total: data.length, data });
}

function getTour(req, res) {
    const tour = toursService.findById(Number(req.params.id));
    res.json({ ok: true, data: tour });
}

function createTour(req, res) {
    const nuevo = toursService.create(req.body);
    res.status(201).json({ ok: true, data: nuevo });
}

// le paso el usuario para que el service revise si el tour es suyo
function updateTour(req, res) {
    const tour = toursService.update(Number(req.params.id), req.body, req.usuario);
    res.json({ ok: true, data: tour });
}

function deleteTour(req, res) {
    toursService.remove(Number(req.params.id));
    res.status(204).send();
}

export { listTours, getTour, createTour, updateTour, deleteTour };
