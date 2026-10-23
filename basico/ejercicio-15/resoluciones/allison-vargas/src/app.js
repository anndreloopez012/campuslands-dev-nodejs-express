import { manejarRuta } from './routes/ejercicio.routes.js';
import { rutaNoEncontrada } from './controllers/ejercicio.controller.js';

const BASE = '/basico/ejercicio-15';

export function handler(req, res) {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  if (!pathname.startsWith(BASE)) {
    return rutaNoEncontrada(req, res);
  }

  return manejarRuta(req, res, pathname);
}
