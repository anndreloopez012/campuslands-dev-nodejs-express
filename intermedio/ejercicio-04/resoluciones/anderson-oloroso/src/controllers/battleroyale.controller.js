import { getStormPhases, calculateSurvival } from '../services/storm.service.js';
import { generateAirdrop } from '../services/airdrop.service.js';

export const getHealth = (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'servicios reutilizables'
  });
};

export const getPhases = (req, res) => {
  const data = getStormPhases();
  return res.status(200).json({
    ok: true,
    total: data.length,
    data
  });
};

export const postCalculateSurvival = (req, res) => {
  try {
    const { fase, tiempoSegundos, hpActual } = req.body;

    if (fase === undefined || tiempoSegundos === undefined || hpActual === undefined) {
      return res.status(400).json({
        ok: false,
        message: 'Los parámetros fase, tiempoSegundos y hpActual son obligatorios.'
      });
    }

    const result = calculateSurvival(Number(fase), Number(tiempoSegundos), Number(hpActual));
    return res.status(200).json({
      ok: true,
      message: 'Cálculo de daño de tormenta realizado con éxito',
      data: result
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message
    });
  }
};

export const postAirdrop = (req, res) => {
  try {
    const { x, y } = req.body;
    const airdrop = generateAirdrop(x, y);
    return res.status(201).json({
      ok: true,
      message: 'Suministro aéreo lanzado en coordenadas solicitadas',
      data: airdrop
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message
    });
  }
};
