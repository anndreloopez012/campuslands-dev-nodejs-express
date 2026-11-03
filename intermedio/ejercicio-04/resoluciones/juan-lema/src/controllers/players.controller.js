import { listPlayers, getPlayerById, createPlayer } from "../services/players.service.js";

const getPlayers = (req, res) => res.json({ ok: true, data: listPlayers() });

function getPlayer(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const player = getPlayerById(id);
  if (!player) return res.status(404).json({ ok: false, message: `Jugador con id ${id} no encontrado` });

  res.json({ ok: true, data: player });
}

function postPlayer(req, res) {
  try {
    res.status(201).json({ ok: true, data: createPlayer(req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getPlayers, getPlayer, postPlayer };
