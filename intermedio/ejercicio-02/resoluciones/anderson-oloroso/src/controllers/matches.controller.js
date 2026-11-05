import * as service from '../services/shooters.service.js';

export const listMatches = (req, res) => {
  return res.status(200).json({
    ok: true,
    module: 'Historial de Partidas Competitivas',
    total: service.getMatches().length,
    data: service.getMatches()
  });
};

export const registerMatch = (req, res) => {
  try {
    const { map, agent, weapon, kills, deaths } = req.body;
    if (!map || !agent || !weapon || kills === undefined || deaths === undefined) {
      return res.status(400).json({
        ok: false,
        message: 'Todos los campos (map, agent, weapon, kills, deaths) son requeridos.'
      });
    }
    const match = service.createMatch({
      map,
      agent,
      weapon,
      kills: Number(kills),
      deaths: Number(deaths)
    });
    return res.status(201).json({
      ok: true,
      message: 'Partida registrada correctamente',
      data: match
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message
    });
  }
};
