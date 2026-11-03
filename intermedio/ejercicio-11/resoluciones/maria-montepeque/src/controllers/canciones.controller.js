import * as cancionesService from "../services/canciones.service.js";

function listCanciones(req, res) {
    const data = cancionesService.findAll();
    res.json({ ok: true, total: data.length, data });
}

function buscarCanciones(req, res) {
    // q es lo que escribe el usuario, campo es opcional
    const { q, campo } = req.query;
    const data = cancionesService.search(q, campo);
    res.json({ ok: true, query: q.trim(), total: data.length, data });
}

function getCancion(req, res) {
    const cancion = cancionesService.findById(Number(req.params.id));
    res.json({ ok: true, data: cancion });
}

export { listCanciones, buscarCanciones, getCancion };
