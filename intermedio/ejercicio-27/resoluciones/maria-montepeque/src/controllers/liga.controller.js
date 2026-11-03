import * as liga from "../services/liga.service.js";

function listEquipos(req, res) {
    const data = liga.findEquipos({ region: req.query.region });
    res.json({ ok: true, total: data.length, data });
}

function getEquipo(req, res) {
    const data = liga.findEquipo(Number(req.params.id));
    res.json({ ok: true, data });
}

function getJugadores(req, res) {
    const equipo = liga.findEquipo(Number(req.params.id));
    res.json({ ok: true, equipo: equipo.nombre, data: equipo.jugadores });
}

function crearEquipo(req, res) {
    const data = liga.crearEquipo(req.body);
    res.status(201).location(`/api/equipos/${data.id}`).json({ ok: true, data });
}

function registrarPartida(req, res) {
    const data = liga.registrarPartida(req.body);
    res.status(201).json({ ok: true, data });
}

function verClasificacion(req, res) {
    res.json({ ok: true, data: liga.clasificacion() });
}

export { listEquipos, getEquipo, getJugadores, crearEquipo, registrarPartida, verClasificacion };
