import { listMatches, getMatchById, createMatch, joinMatch, deleteMatch } from "../services/matches.service.js";

function getMatches(req, res) {
  res.status(200).json({ ok: true, data: listMatches() });
}

function getMatch(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) {
    res.status(400).json({ ok: false, message: "id debe ser numerico" });
    return;
  }

  const match = getMatchById(id);
  if (!match) {
    res.status(404).json({ ok: false, message: `Partida con id ${id} no encontrada` });
    return;
  }

  res.status(200).json({ ok: true, data: match });
}

function postMatch(req, res, next) {
  try {
    const match = createMatch(req.body || {});
    res.status(201).json({ ok: true, data: match });
  } catch (error) {
    next(error);
  }
}

function postJoin(req, res, next) {
  const playerName = req.get("x-player-name");
  if (!playerName) {
    res.status(401).json({ ok: false, message: "Header x-player-name requerido" });
    return;
  }

  try {
    const match = joinMatch(req.params.id, playerName);
    res.status(200).json({ ok: true, data: match });
  } catch (error) {
    next(error);
  }
}

function removeMatch(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) {
    res.status(400).json({ ok: false, message: "id debe ser numerico" });
    return;
  }

  const removed = deleteMatch(id);
  if (!removed) {
    res.status(404).json({ ok: false, message: `Partida con id ${id} no encontrada` });
    return;
  }

  res.status(204).end();
}

function crash() {
  // Ruta de demostracion: dispara un error no controlado a proposito
  // para mostrar el middleware central de errores (500).
  throw new Error("Fallo simulado del servidor");
}

export { getMatches, getMatch, postMatch, postJoin, removeMatch, crash };
