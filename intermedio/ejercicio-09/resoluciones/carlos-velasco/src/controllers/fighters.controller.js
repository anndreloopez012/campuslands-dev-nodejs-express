const { buscarPeleadores, modalidadesValidas } = require('../services/fighters.service');

function listarPeleadores(req, res) {
  const resultado = buscarPeleadores({
    nombre: req.query.nombre,
    pais: req.query.pais,
    modalidad: req.query.modalidad,
    orden: req.query.orden,
    page: req.query.page,
    limit: req.query.limit
  });

  if (resultado.error) {
    return res.status(400).json({ ok: false, message: resultado.error });
  }

  return res.status(200).json({
    ok: true,
    paginacion: resultado.pagina,
    filters: {
      nombre: req.query.nombre || null,
      pais: req.query.pais || null,
      modalidad: req.query.modalidad || null,
      orden: req.query.orden || null,
      modalidades_disponibles: modalidadesValidas
    },
    data: resultado.items
  });
}

module.exports = { listarPeleadores };
