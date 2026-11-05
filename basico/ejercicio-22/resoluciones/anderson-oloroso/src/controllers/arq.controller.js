import * as mat from '../services/materiales.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'servicios simples' });

export const getMateriales = (_req, res) => res.status(200).json({ ok: true, data: mat.listarMateriales() });

export const postPresupuesto = (req, res) => {
  try {
    const { largo, ancho, alto, material } = req.body;
    if (!largo || !ancho || !alto || !material) {
      return res.status(400).json({ ok: false, message: 'largo, ancho, alto y material son obligatorios.' });
    }
    const resultado = mat.calcularPresupuesto({ largo: +largo, ancho: +ancho, alto: +alto, material });
    return res.status(200).json({ ok: true, data: resultado });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};
