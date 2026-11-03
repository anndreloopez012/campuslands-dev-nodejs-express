import * as service from '../services/blueprints.service.js';

export const getStatus = (req, res) => {
  res.json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "servicios simples"
  });
};

export const getBlueprints = (req, res) => {
  res.json({ ok: true, data: service.getAll() });
};

export const getBlueprintById = (req, res) => {
  const found = service.getById(Number(req.params.id));
  if (!found) return res.status(404).json({ ok: false, message: "Plano no encontrado" });
  res.json({ ok: true, data: found });
};

export const createBlueprint = (req, res) => {
  const { title, areaM2, floors } = req.body;
  if (!title || !areaM2 || !floors) {
    return res.status(400).json({ ok: false, message: "Campos title, areaM2 y floors son obligatorios" });
  }
  const created = service.create({ title, areaM2, floors });
  res.status(201).json({ ok: true, data: created });
};
