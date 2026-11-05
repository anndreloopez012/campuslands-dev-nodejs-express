import * as pingpongService from '../services/pingpong.service.js';

export const getHealth = (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'ordenamiento de resultados'
  });
};

export const listPlayers = (req, res) => {
  try {
    const { sortBy, order } = req.query;

    if (order && !['asc', 'desc'].includes(order.toLowerCase())) {
      return res.status(400).json({
        ok: false,
        message: 'El parámetro order debe ser exclusivamente "asc" o "desc".'
      });
    }

    const result = pingpongService.getSortedPlayers({
      sortBy: sortBy || 'ranking',
      order: order || 'asc'
    });

    return res.status(200).json({
      ok: true,
      ...result
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message
    });
  }
};
