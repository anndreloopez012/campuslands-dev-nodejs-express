// Controlador: recibe la peticion HTTP, valida la entrada minima y arma la respuesta.

import { listarPeleadores, crearPeleador } from '../services/peleadores.service.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'JSON y persistencia simple',
  });
}

export async function obtenerPeleadores(req, res) {
  try {
    const peleadores = await listarPeleadores();

    return res.status(200).json({ ok: true, peleadores });
  } catch (error) {
    console.error('Error leyendo peleadores:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al leer los peleadores',
    });
  }
}

export async function crearNuevoPeleador(req, res) {
  try {
    const { nombre, categoria_peso } = req.body;

    if (!nombre || !categoria_peso) {
      return res.status(400).json({
        ok: false,
        message: 'nombre y categoria_peso son obligatorios',
      });
    }

    const peleador = await crearPeleador({ nombre, categoria_peso });

    return res.status(201).json({ ok: true, peleador });
  } catch (error) {
    console.error('Error creando peleador:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al crear el peleador',
    });
  }
}
