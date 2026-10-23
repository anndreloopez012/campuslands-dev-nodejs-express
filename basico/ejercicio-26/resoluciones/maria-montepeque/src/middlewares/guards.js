import { HttpError } from "../core/http.js";

const RATE_LIMIT = 5;
const WINDOW_MS = 10_000;

const hits = new Map();
const state = { maintenance: false };

function authenticate(req) {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) throw new HttpError(401, "Falta la cabecera x-api-key", { "WWW-Authenticate": "ApiKey" });
    if (apiKey === "banned-player") throw new HttpError(403, "Jugador baneado por conducta toxica");

    req.player = apiKey;
}

function rateLimit(req) {
    const now = Date.now();
    const recent = (hits.get(req.player) ?? []).filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    hits.set(req.player, recent);

    if (recent.length > RATE_LIMIT) {
        const retryAfter = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
        throw new HttpError(429, `Maximo ${RATE_LIMIT} peticiones cada ${WINDOW_MS / 1000} s`, { "Retry-After": String(retryAfter) });
    }
}

function maintenance(req) {
    if (state.maintenance && req.url !== "/maintenance") {
        throw new HttpError(503, "Servidores en mantenimiento programado", { "Retry-After": "120" });
    }
}

function setMaintenance(enabled) {
    state.maintenance = Boolean(enabled);
    return state.maintenance;
}

export { authenticate, rateLimit, maintenance, setMaintenance };
