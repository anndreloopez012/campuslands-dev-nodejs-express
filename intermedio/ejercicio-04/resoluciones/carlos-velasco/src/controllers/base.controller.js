const { AppError } = require('../errors/app.error');

/**
 * Controlador generico reutilizado por ambos dominios.
 * Recibe el servicio por factory, no lo importa directamente.
 */
function crearControladores({ servicio, recurso }) {
  function listar(req, res, next) {
    try {
      return res.status(200).json({ ok: true, data: servicio.listar() });
    } catch (error) {
      return next(error);
    }
  }

  function obtener(req, res, next) {
    try {
      return res.status(200).json({ ok: true, data: servicio.obtener(Number(req.params.id)) });
    } catch (error) {
      return next(error);
    }
  }

  function crear(req, res, next) {
    try {
      const data = servicio.crear(req.body);
      return res.status(201).json({ ok: true, message: `${recurso} creado`, data });
    } catch (error) {
      return next(error);
    }
  }

  function actualizar(req, res, next) {
    try {
      const data = servicio.actualizar(Number(req.params.id), req.body);
      return res.status(200).json({ ok: true, message: `${recurso} actualizado`, data });
    } catch (error) {
      return next(error);
    }
  }

  function eliminar(req, res, next) {
    try {
      servicio.eliminar(Number(req.params.id));
      return res.status(200).json({ ok: true, message: `${recurso} eliminado` });
    } catch (error) {
      return next(error);
    }
  }

  return { listar, obtener, crear, actualizar, eliminar };
}

module.exports = { crearControladores, AppError };
