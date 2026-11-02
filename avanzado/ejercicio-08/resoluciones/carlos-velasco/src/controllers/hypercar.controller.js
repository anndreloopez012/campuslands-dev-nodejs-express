const hypercarService = require('../services/hypercar.service');

const createHypercar = (req, res) => {
  try {
    const hypercar = hypercarService.createHypercar(req.body);

    res.status(201).json({
      ok: true,
      message: 'Hiperdeportivo registrado correctamente',
      data: hypercar
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message || 'Error interno del servidor'
    });
  }
};

module.exports = {
  createHypercar
};