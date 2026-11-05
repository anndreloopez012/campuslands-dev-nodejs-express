import { molarMass } from '../services/formulas.service.js';

export const mass = (req, res) => {
  try {
    const formula = req.params.formula;
    res.status(200).json({ ok: true, formula, molarMass: molarMass(formula), unit: 'g/mol' });
  } catch (err) {
    res.status(400).json({ ok: false, message: err.message });
  }
};
