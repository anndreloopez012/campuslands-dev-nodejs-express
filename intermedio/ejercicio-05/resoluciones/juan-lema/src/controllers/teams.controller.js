import { listTeams, getTeamById, createTeam } from "../services/teams.service.js";

const getTeams = (req, res) => res.json({ ok: true, data: listTeams() });

function getTeam(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const team = getTeamById(id);
  if (!team) return res.status(404).json({ ok: false, message: `Equipo con id ${id} no encontrado` });

  res.json({ ok: true, data: team });
}

function postTeam(req, res) {
  try {
    res.status(201).json({ ok: true, data: createTeam(req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getTeams, getTeam, postTeam };
