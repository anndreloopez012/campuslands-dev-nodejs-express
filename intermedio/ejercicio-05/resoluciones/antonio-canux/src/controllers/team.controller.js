import { TeamService } from '../services/team.service.js';

export const getAllTeams = async (req, res) => {
  try {
    const teams = await TeamService.listTeams();
    res.status(200).json({
      ok: true,
      total: teams.length,
      data: teams
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await TeamService.getTeam(id);
    res.status(200).json({ ok: true, data: team });
  } catch (error) {
    res.status(error.statusCode || 500).json({ ok: false, message: error.message });
  }
};

export const createTeam = async (req, res) => {
  try {
    const newTeam = await TeamService.registerTeam(req.body);
    res.status(201).json({
      ok: true,
      message: "Equipo registrado con éxito",
      data: newTeam
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({ ok: false, message: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    await TeamService.removeTeam(id);
    res.status(200).json({
      ok: true,
      message: `Equipo ${id} eliminado correctamente`
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ ok: false, message: error.message });
  }
};