import * as service from '../services/weldingCalculator.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'testing con node test' });

export const calculateHeat = (req, res) => {
  try {
    const { voltaje, amperaje, velocidadAvanceMmS, eficiencia } = req.body;
    const result = service.calcularCalorAportado({
      voltaje: Number(voltaje),
      amperaje: Number(amperaje),
      velocidadAvanceMmS: Number(velocidadAvanceMmS),
      eficiencia: eficiencia ? Number(eficiencia) : 0.8
    });
    return res.status(200).json({ ok: true, data: result });
  } catch (err) {
    return res.status(400).json({ ok: false, message: err.message });
  }
};
