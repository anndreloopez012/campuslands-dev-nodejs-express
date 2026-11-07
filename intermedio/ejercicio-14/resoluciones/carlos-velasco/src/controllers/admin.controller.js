const libraryService = require('../services/library.service');
const { extraerToken } = require('../auth/extraer.token');

async function registrarLibro(req, res, next) {
  try {
    const libro = libraryService.registrarLibro(extraerToken(req), req.body);
    return res.status(201).json({ ok: true, message: 'Libro registrado', data: libro });
  } catch (error) {
    return next(error);
  }
}

module.exports = { registrarLibro };
