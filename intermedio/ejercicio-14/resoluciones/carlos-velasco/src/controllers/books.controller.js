const libraryService = require('../services/library.service');
const { extraerToken } = require('../auth/extraer.token');

async function listarLibros(req, res, next) {
  try {
    const sesion = libraryService.validarSesion(extraerToken(req));
    return res.status(200).json({ ok: true, autenticado_como: sesion.usuario, data: libraryService.listarLibros() });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarLibros };
