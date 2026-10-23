import { listPlayers, getPlayerById, createPlayer } from "../services/players.service.js";

function getPlayers(req, res) {
  res.json({ ok: true, data: listPlayers() });
}

function getPlayer(req, res) {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    res.status(400).json({ ok: false, message: "id debe ser numerico" });
    return;
  }

  const player = getPlayerById(id);
  if (!player) {
    res.status(404).json({ ok: false, message: `Jugador con id ${id} no encontrado` });
    return;
  }

  res.json({ ok: true, data: player });
}

function postPlayer(req, res) {
  try {
    const player = createPlayer(req.body || {});
    res.status(201).json({ ok: true, data: player });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getPlayers, getPlayer, postPlayer };
