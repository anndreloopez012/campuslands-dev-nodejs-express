import * as resenasService from "../services/resenas.service.js";

// peliculaId viene de la ruta padre gracias a mergeParams
function listResenas(req, res) {
    const data = resenasService.findByPelicula(Number(req.params.peliculaId));
    res.json({ ok: true, total: data.length, data });
}

function getResena(req, res) {
    const resena = resenasService.findOne(Number(req.params.peliculaId), Number(req.params.resenaId));
    res.json({ ok: true, data: resena });
}

function createResena(req, res) {
    const nueva = resenasService.create(Number(req.params.peliculaId), req.body);
    res.status(201).json({ ok: true, data: nueva });
}

function deleteResena(req, res) {
    resenasService.remove(Number(req.params.peliculaId), Number(req.params.resenaId));
    res.status(204).send();
}

export { listResenas, getResena, createResena, deleteResena };
