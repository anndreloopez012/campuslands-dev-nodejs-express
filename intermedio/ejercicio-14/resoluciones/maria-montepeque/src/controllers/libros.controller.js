import * as librosService from "../services/libros.service.js";

function listLibros(req, res) {
    const data = librosService.findAll();
    res.json({ ok: true, total: data.length, data });
}

function getLibro(req, res) {
    const libro = librosService.findById(Number(req.params.id));
    res.json({ ok: true, data: libro });
}

function createLibro(req, res) {
    const nuevo = librosService.create(req.body, req.usuario.id);
    res.status(201).json({ ok: true, data: nuevo });
}

function deleteLibro(req, res) {
    librosService.remove(Number(req.params.id));
    res.status(204).send();
}

export { listLibros, getLibro, createLibro, deleteLibro };
