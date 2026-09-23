import matchService from '../services/match.service.js';

export const getMatch = (req, res) => {
  try {
    const data = matchService.getMatchInfo();

    return res.status(200).json({
      ok: true,
      message: "Ejercicio 02 ejecutado correctamente",
      topic: "npm scripts y package.json",
      data
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error en el servidor"
    });
  }
};