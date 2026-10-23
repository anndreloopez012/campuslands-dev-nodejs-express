import { listTeams, getTeamById, createTeam } from "../services/teams.service.js";

function getTeams(req, res) {
  res.status(200).json({ ok: true, data: listTeams() });
}

function getTeam(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) {
    res.status(400).json({ ok: false, message: "id debe ser numerico" });
    return;
  }

  const team = getTeamById(id);
  if (!team) {
    res.status(404).json({ ok: false, message: `Equipo con id ${id} no encontrado` });
    return;
  }

  res.status(200).json({ ok: true, data: team });
}

function postTeam(req, res) {
  try {
    const team = createTeam(req.body || {});
    res.status(201).json({ ok: true, data: team });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getTeams, getTeam, postTeam };
