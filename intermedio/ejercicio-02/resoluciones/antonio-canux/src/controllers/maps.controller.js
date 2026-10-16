import { maps } from '../data/maps.data.js';

export const listMaps = (req, res) => {
  res.status(200).json({
    ok: true,
    total: maps.length,
    data: maps
  });
};

export const getMapById = (req, res) => {
  const { id } = req.params;
  const map = maps.find(m => m.id === Number(id));

  if (!map) {
    return res.status(404).json({
      ok: false,
      message: `Mapa con id ${id} no encontrado`
    });
  }

  res.status(200).json({
    ok: true,
    data: map
  });
};
