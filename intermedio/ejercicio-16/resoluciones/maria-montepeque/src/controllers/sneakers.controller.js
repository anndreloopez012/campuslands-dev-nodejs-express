import * as sneakersService from "../services/sneakers.service.js";

function listSneakers(req, res) {
    const data = sneakersService.findAll();
    res.json({ ok: true, total: data.length, data });
}

function getSneaker(req, res) {
    const sneaker = sneakersService.findById(Number(req.params.id));
    res.json({ ok: true, data: sneaker });
}

function createSneaker(req, res) {
    const nuevo = sneakersService.create(req.body);
    res.status(201).json({ ok: true, data: nuevo });
}

function updateStock(req, res) {
    const sneaker = sneakersService.updateStock(Number(req.params.id), req.body);
    res.json({ ok: true, data: sneaker });
}

export { listSneakers, getSneaker, createSneaker, updateStock };
