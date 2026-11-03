// cada respuesta usa el status code que le corresponde exactamente, 
// con un comentario explicando por que ese y no otro.

import {
  listarPersonajes,
  buscarPersonajePorId,
  existeNombre,
  crearPersonaje,
  actualizarPersonaje,
  eliminarPersonaje,
  buscarArmaPorId,
} from '../services/personajes.service.js';
import { validarPersonaje } from '../validators/personaje.validator.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'respuestas HTTP correctas',
  });
}

export async function obtenerPersonajes(req, res, next) {
  try {
    const personajes = await listarPersonajes();
    // 200: todo salio bien, aqui esta el recurso pedido.
    return res.status(200).json({ ok: true, personajes });
  } catch (error) {
    next(error);
  }
}

export async function obtenerPersonajePorId(req, res, next) {
  try {
    const { id } = req.params;
    const personaje = await buscarPersonajePorId(id);

    if (!personaje) {
      // 404: el cliente pidio un recurso que no existe.
      return res.status(404).json({ ok: false, message: `No existe un personaje con id ${id}` });
    }

    return res.status(200).json({ ok: true, personaje });
  } catch (error) {
    next(error);
  }
}

export async function crearNuevoPersonaje(req, res, next) {
  try {
    const { valido, errores } = validarPersonaje(req.body);

    if (!valido) {
      // 400: la peticion esta mal formada (datos invalidos o faltantes).
      return res.status(400).json({ ok: false, errores });
    }

    const nombreDuplicado = await existeNombre(req.body.nombre);

    if (nombreDuplicado) {
      // 409 Conflict: los datos son validos, pero chocan con el estado
      // actual del sistema (ya existe alguien con ese nombre).
      return res.status(409).json({
        ok: false,
        message: `Ya existe un personaje llamado "${req.body.nombre}"`,
      });
    }

    const personaje = await crearPersonaje(req.body);

    // 201 Created: se creo un recurso nuevo, se devuelve el recurso.
    return res.status(201).json({ ok: true, personaje });
  } catch (error) {
    next(error);
  }
}

export async function actualizarPersonajeExistente(req, res, next) {
  try {
    const { id } = req.params;
    const { valido, errores } = validarPersonaje(req.body);

    if (!valido) {
      return res.status(400).json({ ok: false, errores });
    }

    const personaje = await actualizarPersonaje(id, req.body);

    if (!personaje) {
      return res.status(404).json({ ok: false, message: `No existe un personaje con id ${id}` });
    }

    // 200: se actualizo con exito, se devuelve el recurso actualizado.
    return res.status(200).json({ ok: true, personaje });
  } catch (error) {
    next(error);
  }
}

export async function eliminarPersonajeExistente(req, res, next) {
  try {
    const { id } = req.params;
    const eliminado = await eliminarPersonaje(id);

    if (!eliminado) {
      return res.status(404).json({ ok: false, message: `No existe un personaje con id ${id}` });
    }

    // 204 No Content: se elimino con exito, no hay nada que devolver.
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function equiparArma(req, res, next) {
  try {
    const { id } = req.params;
    const { armaId } = req.body;

    const personaje = await buscarPersonajePorId(id);

    if (!personaje) {
      return res.status(404).json({ ok: false, message: `No existe un personaje con id ${id}` });
    }

    const arma = await buscarArmaPorId(armaId);

    if (!arma) {
      return res.status(404).json({ ok: false, message: `No existe un arma con id ${armaId}` });
    }

    if (personaje.nivel < arma.nivel_requerido) {
      // 403 Forbidden: sabemos exactamente quien es (el personaje existe),
      // pero no cumple el requisito para esta accion. Distinto de 401
      // (que seria "no sabemos quien eres, identificate primero").
      return res.status(403).json({
        ok: false,
        message: `${personaje.nombre} (nivel ${personaje.nivel}) no puede equipar "${arma.nombre}" (requiere nivel ${arma.nivel_requerido})`,
      });
    }

    return res.status(200).json({
      ok: true,
      message: `${personaje.nombre} equipo "${arma.nombre}"`,
    });
  } catch (error) {
    next(error);
  }
}
