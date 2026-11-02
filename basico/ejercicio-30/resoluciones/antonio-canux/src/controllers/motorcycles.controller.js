import * as service from '../services/motorcycles.service.js';

export const getStatus = (req, res) => {
  res.json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "proyecto integrador basico"
  });
};

export const getMotorcycles = (req, res) => {
  res.json({ ok: true, total: service.getAll().length, data: service.getAll() });
};

export const getMotorcycleById = (req, res) => {
  const found = service.getById(Number(req.params.id));
  if (!found) return res.status(404).json({ ok: false, message: "Motocicleta no encontrada en el taller" });
  res.json({ ok: true, data: found });
};

export const createMotorcycle = (req, res) => {
  const { brand, model, displacementCC, serviceType, status } = req.body;
  if (!brand || !model || !displacementCC) {
    return res.status(400).json({ ok: false, message: "Marca, modelo y cilindraje son obligatorios" });
  }
  const created = service.create({ brand, model, displacementCC, serviceType, status });
  res.status(201).json({ ok: true, message: "Moto ingresada al taller", data: created });
};

export const updateMotorcycle = (req, res) => {
  const updated = service.update(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ ok: false, message: "Motocicleta no encontrada" });
  res.json({ ok: true, message: "Moto actualizada", data: updated });
};

export const deleteMotorcycle = (req, res) => {
  const deleted = service.remove(Number(req.params.id));
  if (!deleted) return res.status(404).json({ ok: false, message: "Motocicleta no encontrada" });
  res.json({ ok: true, message: "Moto retirada del taller", data: deleted });
};
