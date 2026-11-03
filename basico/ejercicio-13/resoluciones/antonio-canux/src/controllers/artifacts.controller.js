import * as service from '../services/artifacts.service.js';

export const getStatus = (req, res) => {
  res.json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "manejo de errores"
  });
};

export const getArtifacts = async (req, res, next) => {
  try {
    const data = await service.getAll();
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
};

export const getArtifactById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      const err = new Error("El ID galáctico debe ser un entero positivo.");
      err.statusCode = 400;
      throw err;
    }
    const data = await service.getById(id);
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
};

export const createArtifact = async (req, res, next) => {
  try {
    const data = await service.create(req.body);
    res.status(201).json({ ok: true, message: "Artefacto registrado", data });
  } catch (error) {
    next(error);
  }
};
