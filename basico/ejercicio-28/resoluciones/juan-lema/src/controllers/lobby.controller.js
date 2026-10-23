import config from "../config/index.js";

function getLobbyLimit(req, res) {
  res.status(200).json({ ok: true, data: { env: config.env, maxLobbySize: config.maxLobbySize } });
}

function getDebugConfig(req, res) {
  if (!config.exposeDebugRoutes) {
    res.status(404).json({ ok: false, message: "Ruta no encontrada" });
    return;
  }
  res.status(200).json({ ok: true, data: config });
}

export { getLobbyLimit, getDebugConfig };
