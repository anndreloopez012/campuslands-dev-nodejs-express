import * as fightersService from '../services/fighters.service.js';

export const getHealth = (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'paginacion y filtros'
  });
};

export const listFighters = (req, res) => {
  try {
    const { page, limit, division, minKos, status } = req.query;

    if (page && (isNaN(Number(page)) || Number(page) < 1)) {
      return res.status(400).json({
        ok: false,
        message: 'El parámetro page debe ser un número entero mayor o igual a 1.'
      });
    }

    if (limit && (isNaN(Number(limit)) || Number(limit) < 1)) {
      return res.status(400).json({
        ok: false,
        message: 'El parámetro limit debe ser un número entero positivo.'
      });
    }

    const result = fightersService.getPaginatedFighters({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 3,
      division,
      minKos,
      status
    });

    return res.status(200).json({
      ok: true,
      ...result
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
};
