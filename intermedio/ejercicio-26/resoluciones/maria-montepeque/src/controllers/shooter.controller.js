import { obtenerStats } from "../services/stats.service.js";
import { crearPartida, listarPartidas } from "../services/partidas.service.js";

const catchAsync = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const verStats = catchAsync(async (req, res) => {
    const data = await obtenerStats(req.params.gamertag);
    res.json({ ok: true, data });
});

const armarPartida = catchAsync(async (req, res) => {
    const data = await crearPartida(req.body);
    res.status(201).json({ ok: true, data });
});

function verPartidas(req, res) {
    const data = listarPartidas();
    res.json({ ok: true, total: data.length, data });
}

export { verStats, armarPartida, verPartidas };
