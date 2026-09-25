import {
  ejecutarEjercicio,
  obtenerPuestos,
  obtenerPuestoPorId,
  rutaNoEncontrada,
} from '../controllers/ejercicio.controller.js';

const BASE = '/basico/ejercicio-15';

export function manejarRuta(req, res, pathname) {
  const partes = pathname.replace(BASE, '').split('/').filter(Boolean);
  // pathname "/basico/ejercicio-15/puestos/3" -> partes = ['puestos', '3']

  if (req.method === 'GET' && partes.length === 0) {
    return ejecutarEjercicio(req, res);
  }

  if (req.method === 'GET' && partes[0] === 'puestos' && partes.length === 1) {
    return obtenerPuestos(req, res);
  }

  if (req.method === 'GET' && partes[0] === 'puestos' && partes.length === 2) {
    return obtenerPuestoPorId(req, res, { id: partes[1] });
  }

  return rutaNoEncontrada(req, res);
}
