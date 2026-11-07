const { listarJugadores, camposOrdenables } = require('../services/players.service');

function listarJugadoresEndpoint(req, res) {
  const resultado = listarJugadores({
    ordenar: req.query.ordenar,
    direccion: req.query.direccion,
    pais: req.query.pais
  });

  if (resultado.error) {
    return res.status(400).json({ ok: false, message: resultado.error });
  }

  return res.status(200).json({
    ok: true,
    sorting: {
      ordenar: req.query.ordenar || 'puntos',
      direccion: req.query.direccion || 'desc',
      campos_disponibles: Object.keys(camposOrdenables),
      direcciones_validas: ['asc', 'desc']
    },
    data: resultado.data
  });
}

module.exports = { listarJugadoresEndpoint };
