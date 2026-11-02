import { principal, listar, obtener, crear } from '../controllers/platos.controller.js';
import { enviarJson } from '../utils/respuesta.js';

const BASE = '/basico/ejercicio-15';

export function manejarPeticion(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const ruta = url.pathname;
  const metodo = req.method;

  if (metodo === 'GET' && ruta === '/health') {
    return enviarJson(res, 200, { ok: true });
  }

  if (metodo === 'GET' && ruta === BASE) {
    return principal(req, res);
  }

  if (metodo === 'GET' && ruta === BASE + '/platos') {
    return listar(req, res);
  }

  if (metodo === 'GET' && ruta.startsWith(BASE + '/platos/')) {
    const id = Number(ruta.split('/')[4]);
    return obtener(req, res, id);
  }

  if (metodo === 'POST' && ruta === BASE + '/platos') {
    return crear(req, res);
  }

  enviarJson(res, 404, { ok: false, message: 'Ruta no encontrada' });
}
