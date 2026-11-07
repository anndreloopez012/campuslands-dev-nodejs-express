const libraryService = require('../services/library.service');
const { extraerToken } = require('../auth/extraer.token');

async function login(req, res, next) {
  try {
    const sesion = libraryService.login(req.body.usuario, req.body.contrasena);
    // Credenciales correctas responden solo los datos publics de la sesion
    return res.status(201).json({ ok: true, message: 'Sesion iniciada', data: sesion });
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res, next) {
  try {
    libraryService.logout(extraerToken(req));
    return res.status(200).json({ ok: true, message: 'Sesion cerrada' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { login, logout };
