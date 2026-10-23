import { json, readJson } from "../core/http.js";
import * as league from "../services/league.service.js";

function getModalities(req, res) {
    json(res, 200, { ok: true, data: league.MODALITIES });
}

function getTeams(req, res) {
    const data = league.listTeams(req.query.modality);
    json(res, 200, { ok: true, count: data.length, data });
}

function getTeam(req, res) {
    json(res, 200, { ok: true, data: league.findTeam(req.params.id) });
}

async function postMatch(req, res) {
    const match = league.recordMatch(await readJson(req));
    json(res, 201, { ok: true, data: match }, { Location: `/matches/${match.id}` });
}

function getMatches(req, res) {
    const data = league.listMatches();
    json(res, 200, { ok: true, count: data.length, data });
}

function getStandings(req, res) {
    json(res, 200, { ok: true, modality: req.params.modality, data: league.standings(req.params.modality) });
}

export { getModalities, getTeams, getTeam, postMatch, getMatches, getStandings };
