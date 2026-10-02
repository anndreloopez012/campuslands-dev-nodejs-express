import { getPersonajes, buscarPersonaje, agregarPersonaje } from '../services/personajes.service.js';
import { exito, fallo } from '../utils/respuestas.js';

export function principal(req, res) {
  exito(res, 'Ejercicio ejecutado correctamente', { topic: 'respuestas HTTP correctas' });
}

export function listar(req, res) {
  exito(res, 'Lista de personajes', getPersonajes());
}

export function obtener(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return fallo(res, 400, 'El id debe ser un numero');
  }

  const personaje = buscarPersonaje(id);

  if (!personaje) {
    return fallo(res, 404, 'Personaje no encontrado');
  }

  exito(res, 'Personaje encontrado', personaje);
}

export function crear(req, res) {
  const body = req.body || {};
  const clasesValidas = ['guerrero', 'mago', 'arquero', 'clerigo'];

  if (typeof body.nombre !== 'string' || body.nombre.trim() === '') {
    return fallo(res, 400, 'El nombre es obligatorio');
  }

  if (!clasesValidas.includes(body.clase)) {
    return fallo(res, 400, 'La clase debe ser guerrero, mago, arquero o clerigo');
  }

  if (!Number.isInteger(body.nivel) || body.nivel < 1 || body.nivel > 100) {
    return fallo(res, 400, 'El nivel debe ser un entero entre 1 y 100');
  }

  const nuevo = agregarPersonaje(body.nombre.trim(), body.clase, body.nivel);
  exito(res, 'Personaje creado', nuevo, 201);
}
