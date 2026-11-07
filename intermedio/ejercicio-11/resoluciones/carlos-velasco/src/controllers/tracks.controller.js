const { buscarPistas, CAMPOS_BUSCABLES } = require('../services/tracks.service');

function buscar(req, res) {
  const resultado = buscarPistas(req.query.q, {
    campo: req.query.campo,
    limite: req.query.limite
  });

  if (resultado.error) {
    return res.status(400).json({ ok: false, message: resultado.error });
  }

  return res.status(200).json({
    ok: true,
    query: req.query.q,
    campo: req.query.campo || 'todos',
    campos_buscables: CAMPOS_BUSCABLES,
    total: resultado.data.length,
    data: resultado.data
  });
}

module.exports = { buscar };
