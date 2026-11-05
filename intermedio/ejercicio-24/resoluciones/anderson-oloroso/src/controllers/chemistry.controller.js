import * as chemService from '../services/chemistry.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'testing de servicios' });

export const calculateMolar = (req, res) => {
  try {
    const { formula } = req.body;
    if (!formula) return res.status(400).json({ ok: false, message: 'El campo formula es obligatorio.' });
    const result = chemService.calcularMasaMolecular(formula);
    return res.status(200).json({ ok: true, data: result });
  } catch (err) {
    return res.status(400).json({ ok: false, message: err.message });
  }
};
