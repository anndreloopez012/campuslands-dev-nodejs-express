// el controller SOLO traduce entre HTTP y el
// servicio (lee req.params/req.body, llama al servicio, decide el
// status code). No tiene logica de negocio ni sabe como se guardan
// los datos.

import {
  listarProyectos,
  buscarProyectoPorId,
  crearProyecto,
  actualizarProyecto,
  eliminarProyecto,
} from '../services/proyectos.service.js';
import { validarProyecto } from '../validators/proyecto.validator.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'estructura src routes controllers',
  });
}

export async function obtenerProyectos(req, res, next) {
  try {
    const proyectos = await listarProyectos();
    return res.status(200).json({ ok: true, proyectos });
  } catch (error) {
    next(error);
  }
}

export async function obtenerProyectoPorId(req, res, next) {
  try {
    const { id } = req.params;
    const proyecto = await buscarProyectoPorId(id);

    if (!proyecto) {
      return res.status(404).json({ ok: false, message: `No existe un proyecto con id ${id}` });
    }

    return res.status(200).json({ ok: true, proyecto });
  } catch (error) {
    next(error);
  }
}

export async function crearNuevoProyecto(req, res, next) {
  try {
    const { valido, errores } = validarProyecto(req.body);

    if (!valido) {
      return res.status(400).json({ ok: false, errores });
    }

    const proyecto = await crearProyecto(req.body);

    return res.status(201).json({ ok: true, proyecto });
  } catch (error) {
    next(error);
  }
}

export async function actualizarProyectoExistente(req, res, next) {
  try {
    const { id } = req.params;
    const { valido, errores } = validarProyecto(req.body);

    if (!valido) {
      return res.status(400).json({ ok: false, errores });
    }

    const proyecto = await actualizarProyecto(id, req.body);

    if (!proyecto) {
      return res.status(404).json({ ok: false, message: `No existe un proyecto con id ${id}` });
    }

    return res.status(200).json({ ok: true, proyecto });
  } catch (error) {
    next(error);
  }
}

export async function eliminarProyectoExistente(req, res, next) {
  try {
    const { id } = req.params;
    const eliminado = await eliminarProyecto(id);

    if (!eliminado) {
      return res.status(404).json({ ok: false, message: `No existe un proyecto con id ${id}` });
    }

    // 204: eliminado con exito, sin contenido que devolver.
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
