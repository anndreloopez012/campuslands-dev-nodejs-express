import { createRouter, json } from "./core/http.js";
import { redact } from "./config/index.js";
import { createLobbyService } from "./services/lobby.service.js";

function createApp({ values: config, sources }) {
    const router = createRouter();
    const lobby = createLobbyService(config);

    router.get("/health", (req, res) => {
        json(res, 200, { ok: true, env: config.env, map: config.MAP_NAME });
    });

    router.get("/match", (req, res) => {
        json(res, 200, { ok: true, data: lobby.describeMatch() });
    });

    router.get("/lobby/join/:name", (req, res) => {
        const { disabled, full, player, remaining } = lobby.joinSquad(req.params.name, req.query.ranked === "true");

        if (disabled) return json(res, 403, { ok: false, message: disabled });
        if (full) return json(res, 409, { ok: false, message: full });

        json(res, 200, { ok: true, data: player, remaining });
    });

    if (config.FEATURE_DEBUG_ROUTES) {
        router.get("/debug/config", (req, res) => {
            json(res, 200, { ok: true, config: redact(config), sources });
        });
    }

    return function handleRequest(req, res) {
        const handler = router.resolve(req);
        if (!handler) return json(res, 404, { ok: false, message: `Ruta ${req.method} ${req.url} no encontrada` });

        handler(req, res);
    };
}

export { createApp };
