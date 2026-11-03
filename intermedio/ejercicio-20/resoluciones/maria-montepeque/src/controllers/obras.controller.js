import * as obrasService from "../services/obras.service.js";

function listObras(req, res) {
    const data = obrasService.findAll();
    // este header solo lo puede leer el front porque esta en exposedHeaders
    res.set("X-Total-Count", String(data.length));
    res.json({ ok: true, data });
}

function createObra(req, res) {
    const nueva = obrasService.create(req.body);
    res.status(201).json({ ok: true, data: nueva });
}

function deleteObra(req, res) {
    obrasService.remove(Number(req.params.id));
    res.status(204).send();
}

function galeria(req, res) {
    const data = obrasService.findPublicas();
    res.json({ ok: true, total: data.length, data });
}

export { listObras, createObra, deleteObra, galeria };
