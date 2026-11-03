// Controlador: recibe la peticion HTTP, llama al servicio
// y arma la respuesta. No mezcla logica de negocio con la ruta.

import { obtenerResumenLoadout, listarArmas } from '../services/loadout.service.js';

export function ejecutarEjercicio(req, res) {
  try {
    const loadout = obtenerResumenLoadout();

    return res.status(200).json({
      ok: true,
      message: 'Ejercicio ejecutado correctamente',
      topic: 'npm scripts y package.json',
      loadout,
    });
  } catch (error) {
    console.error('Error preparando el loadout:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al ejecutar el ejercicio',
    });
  }
}

export function obtenerArmas(req, res) {
  try {
    return res.status(200).json({
      ok: true,
      armas: listarArmas(),
    });
  } catch (error) {
    console.error('Error listando el arsenal:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al listar el arsenal',
    });
  }
}
