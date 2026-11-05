import * as chemService from '../services/chemistry.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'CRUD basico' });

export const listAll = (_req, res) => res.status(200).json({ ok: true, total: chemService.getAll().length, data: chemService.getAll() });

export const getOne = (req, res) => {
  try {
    const data = chemService.getById(req.params.id);
    return res.status(200).json({ ok: true, data });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};

export const createOne = (req, res) => {
  try {
    const { nombreComun, formula, masaMolarGmol, estado } = req.body;
    if (!nombreComun || !formula || masaMolarGmol === undefined) {
      return res.status(400).json({ ok: false, message: 'nombreComun, formula y masaMolarGmol son requeridos.' });
    }
    const created = chemService.create({ nombreComun, formula, masaMolarGmol, estado });
    return res.status(201).json({ ok: true, message: 'Compuesto químico creado', data: created });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};

export const updateOne = (req, res) => {
  try {
    const updated = chemService.update(req.params.id, req.body);
    return res.status(200).json({ ok: true, message: 'Compuesto químico actualizado', data: updated });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};

export const deleteOne = (req, res) => {
  try {
    chemService.remove(req.params.id);
    return res.status(200).json({ ok: true, message: `Compuesto con ID ${req.params.id} eliminado correctamente` });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};
