import { json, readJson, HttpError } from "../core/http.js";
import { statusCatalog } from "../data/status-catalog.js";
import { setMaintenance } from "../middlewares/guards.js";
import * as service from "../services/matchmaking.service.js";

function getStatusCodes(req, res) {
    json(res, 200, { data: statusCatalog });
}

function getMe(req, res) {
    json(res, 200, { data: { player: req.player } });
}

async function postQueue(req, res) {
    const body = await readJson(req);
    const { errors, conflict, ticket } = service.enqueue(req.player, body);

    if (errors) return json(res, 422, { errors });
    if (conflict) return json(res, 409, { message: conflict });

    json(res, 202, { message: "Buscando partida, consulta el ticket", data: ticket }, { Location: `/queue/${ticket.id}` });
}

function getQueueTicket(req, res) {
    if (!/^\d+$/.test(req.params.ticketId)) throw new HttpError(400, "ticketId debe ser numerico");

    const ticket = service.getTicket(req.params.ticketId);
    if (!ticket) throw new HttpError(404, `No existe el ticket ${req.params.ticketId}`);

    json(res, 200, { data: ticket });
}

function deleteQueueTicket(req, res) {
    const { notFound, forbidden } = service.cancelTicket(req.params.ticketId, req.player);

    if (notFound) throw new HttpError(404, `No existe el ticket ${req.params.ticketId}`);
    if (forbidden) throw new HttpError(403, "Solo puedes cancelar tus propios tickets");

    res.writeHead(204).end();
}

function legacyQueue(req, res) {
    res.writeHead(308, { Location: "/queue" }).end();
}

function getTournament(req, res) {
    const tournament = service.getTournament(req.params.id);

    if (!tournament) throw new HttpError(404, `No existe el torneo ${req.params.id}`);
    if (tournament.status === "finished") throw new HttpError(410, `${tournament.name} ya finalizo`);

    json(res, 200, { data: tournament });
}

async function postRegister(req, res) {
    const body = await readJson(req);
    const { notFound, gone, errors, conflict, entry } = service.register(req.params.id, req.player, body);

    if (notFound) throw new HttpError(404, `No existe el torneo ${req.params.id}`);
    if (gone) throw new HttpError(410, "El torneo ya finalizo, no admite inscripciones");
    if (errors) return json(res, 422, { errors });
    if (conflict) return json(res, 409, { message: conflict });

    json(res, 201, { data: entry }, { Location: `/tournaments/${req.params.id}` });
}

function getReplays() {
    throw new HttpError(501, "Las repeticiones estaran disponibles en la proxima temporada");
}

async function postMaintenance(req, res) {
    const { enabled } = await readJson(req);
    json(res, 200, { data: { maintenance: setMaintenance(enabled) } });
}

function crash() {
    throw new Error("Desincronizacion del servidor de partidas");
}

export { getStatusCodes, getMe, postQueue, getQueueTicket, deleteQueueTicket, legacyQueue, getTournament, postRegister, getReplays, postMaintenance, crash };
