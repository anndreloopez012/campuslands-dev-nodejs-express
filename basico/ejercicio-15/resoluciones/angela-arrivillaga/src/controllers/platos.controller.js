import { getPlatos, buscarPlato, agregarPlato } from '../services/platos.service.js';
import { enviarJson } from '../utils/respuesta.js';

export function principal(req, res) {
  enviarJson(res, 200, {
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'mini API HTTP nativa'
  });
}

export function listar(req, res) {
  enviarJson(res, 200, { ok: true, data: getPlatos() });
}

export function obtener(req, res, id) {
  if (Number.isNaN(id)) {
    return enviarJson(res, 400, { ok: false, message: 'El id debe ser un numero' });
  }

  const plato = buscarPlato(id);

  if (!plato) {
    return enviarJson(res, 404, { ok: false, message: 'Plato no encontrado' });
  }

  enviarJson(res, 200, { ok: true, data: plato });
}

export function crear(req, res) {
  let body = '';

  req.on('data', (chunk) => {
    body = body + chunk;
  });

  req.on('end', () => {
    let datos;

    try {
      datos = JSON.parse(body);
    } catch (error) {
      return enviarJson(res, 400, { ok: false, message: 'El JSON enviado no es valido' });
    }

    if (typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
      return enviarJson(res, 400, { ok: false, message: 'El nombre es obligatorio' });
    }

    if (typeof datos.precio !== 'number' || datos.precio <= 0) {
      return enviarJson(res, 400, { ok: false, message: 'El precio debe ser un numero mayor a 0' });
    }

    const nuevo = agregarPlato(datos.nombre.trim(), datos.precio);
    enviarJson(res, 201, { ok: true, data: nuevo });
  });
}
