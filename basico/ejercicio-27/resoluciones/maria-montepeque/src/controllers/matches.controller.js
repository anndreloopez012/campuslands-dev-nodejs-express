import { json, readJson } from "../core/http.js";
import { history, logConfig } from "../core/logger.js";
import { listTeams, listMatches, recordMatch } from "../services/matches.service.js";

function getTeams(req, res) {
    json(res, 200, { ok: true, data: listTeams() });
}

function getMatches(req, res) {
    const data = listMatches();
    req.log.debug("listando partidas", { count: data.length });
    json(res, 200, { ok: true, count: data.length, data });
}

async function postMatch(req, res) {
    const body = await readJson(req);
    const { errors, match } = recordMatch(body);

    if (errors) return json(res, 400, { ok: false, message: "Partida invalida", errors });
    json(res, 201, { ok: true, data: match });
}

function getLogs(req, res) {
    const { level, limit = 20 } = req.query;
    const data = history.filter((entry) => !level || entry.level === level).slice(-Number(limit));
    json(res, 200, { ok: true, config: logConfig, count: data.length, data });
}

function crash(req) {
    req.log.error("fallo simulado antes de responder", { hint: "revisa logs/app.log" });
    throw new Error("Servidor de replays desconectado");
}

export { getTeams, getMatches, postMatch, getLogs, crash };
