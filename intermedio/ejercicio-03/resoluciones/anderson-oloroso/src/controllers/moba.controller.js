import * as mobaService from '../services/moba.service.js';

export const getHealth = (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'controladores limpios'
  });
};

export const getTeams = (req, res) => {
  const data = mobaService.getTeamsList();
  return res.status(200).json({
    ok: true,
    total: data.length,
    data
  });
};

export const getChampions = (req, res) => {
  const data = mobaService.getChampionsList();
  return res.status(200).json({
    ok: true,
    total: data.length,
    data
  });
};

export const postDraftAnalysis = (req, res) => {
  try {
    const { teamName, picks } = req.body;

    if (!teamName || typeof teamName !== 'string' || teamName.trim() === '') {
      return res.status(400).json({
        ok: false,
        message: 'El nombre del equipo (teamName) es requerido.'
      });
    }

    if (!picks || !Array.isArray(picks)) {
      return res.status(400).json({
        ok: false,
        message: 'La lista de selecciones (picks) debe ser un arreglo de 5 campeones.'
      });
    }

    const analysis = mobaService.evaluateDraft({
      teamName: teamName.trim(),
      picks
    });

    return res.status(200).json({
      ok: true,
      message: 'Draft analizado exitosamente por el motor táctico',
      data: analysis
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message
    });
  }
};
