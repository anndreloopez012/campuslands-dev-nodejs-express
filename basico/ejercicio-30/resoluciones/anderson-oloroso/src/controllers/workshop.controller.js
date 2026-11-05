import * as workshopService from '../services/workshop.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'proyecto integrador basico' });

export const listAll = (_req, res) => res.status(200).json({ ok: true, total: workshopService.getAll().length, data: workshopService.getAll() });

export const getOne = (req, res) => {
  try {
    const data = workshopService.getById(req.params.id);
    return res.status(200).json({ ok: true, data });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};

export const createOne = (req, res) => {
  try {
    const created = workshopService.create(req.body);
    return res.status(201).json({ ok: true, message: 'Motocicleta ingresada al taller exitosamente', data: created });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};

export const updateOne = (req, res) => {
  try {
    const updated = workshopService.update(req.params.id, req.body);
    return res.status(200).json({ ok: true, message: 'Estado de motocicleta actualizado', data: updated });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};

export const deleteOne = (req, res) => {
  try {
    workshopService.remove(req.params.id);
    return res.status(204).send(); // 204 No Content
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};
