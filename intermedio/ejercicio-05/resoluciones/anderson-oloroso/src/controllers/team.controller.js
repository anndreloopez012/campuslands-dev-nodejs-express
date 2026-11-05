import * as teamService from '../services/team.service.js';

export const getHealth = (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'repositorios en memoria'
  });
};

export const getAllTeams = async (req, res) => {
  try {
    const { modality } = req.query;
    const teams = await teamService.listAllTeams(modality);
    return res.status(200).json({
      ok: true,
      total: teams.length,
      filtroModalidad: modality || 'todas',
      data: teams
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await teamService.getTeam(id);
    return res.status(200).json({ ok: true, data: team });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ ok: false, message: error.message });
  }
};

export const createTeam = async (req, res) => {
  try {
    const { nombre, modalidad, estadio, titulosLiga, jugadoresRegistrados } = req.body;
    if (!nombre || !modalidad) {
      return res.status(400).json({
        ok: false,
        message: 'El nombre del club y la modalidad ("Fútbol 11" o "Futsal") son requeridos.'
      });
    }
    const newTeam = await teamService.registerTeam({
      nombre,
      modalidad,
      estadio,
      titulosLiga,
      jugadoresRegistrados
    });
    return res.status(201).json({
      ok: true,
      message: 'Club registrado en el repositorio con éxito',
      data: newTeam
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ ok: false, message: error.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await teamService.modifyTeam(id, req.body);
    return res.status(200).json({
      ok: true,
      message: 'Equipo actualizado en el repositorio',
      data: updated
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ ok: false, message: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    await teamService.removeTeam(id);
    return res.status(200).json({
      ok: true,
      message: `Equipo con ID ${id} eliminado del repositorio en memoria`
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ ok: false, message: error.message });
  }
};
