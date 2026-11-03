import * as peliculasService from "../services/peliculas.service.js";

function listPeliculas(req, res) {
    const data = peliculasService.findAll();
    res.json({ ok: true, total: data.length, data });
}

function getPelicula(req, res) {
    const pelicula = peliculasService.findById(Number(req.params.peliculaId));
    res.json({ ok: true, data: pelicula });
}

export { listPeliculas, getPelicula };
