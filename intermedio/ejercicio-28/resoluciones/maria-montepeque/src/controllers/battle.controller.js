import * as authService from "../services/auth.service.js";
import * as escuadras from "../services/escuadras.service.js";
import * as partidas from "../services/partidas.service.js";

const id = (req) => Number(req.params.id);

function login(req, res) {
    res.json({ ok: true, data: authService.login(req.body) });
}

function yo(req, res) {
    res.json({ ok: true, data: { gamertag: req.jugador } });
}

function crearEscuadra(req, res) {
    const data = escuadras.crear(req.body, req.jugador);
    res.status(201).location(`/api/escuadras/${data.id}`).json({ ok: true, data });
}

function verEscuadra(req, res) {
    res.json({ ok: true, data: escuadras.findById(id(req)) });
}

function unirseEscuadra(req, res) {
    res.json({ ok: true, data: escuadras.unirse(id(req), req.jugador) });
}

function crearPartida(req, res) {
    const data = partidas.crear(req.body, req.jugador);
    res.status(201).location(`/api/partidas/${data.id}`).json({ ok: true, data });
}

function verPartida(req, res) {
    res.json({ ok: true, data: partidas.findById(id(req)) });
}

function inscribir(req, res) {
    res.json({ ok: true, data: partidas.inscribir(id(req), req.body, req.jugador) });
}

function iniciar(req, res) {
    res.json({ ok: true, data: partidas.iniciar(id(req), req.jugador) });
}

function eliminar(req, res) {
    res.status(201).json({ ok: true, data: partidas.eliminar(id(req), req.body, req.jugador) });
}

function ranking(req, res) {
    res.json({ ok: true, data: partidas.ranking(id(req)) });
}

export { login, yo, crearEscuadra, verEscuadra, unirseEscuadra, crearPartida, verPartida, inscribir, iniciar, eliminar, ranking };
