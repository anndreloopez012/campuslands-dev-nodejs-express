import {
  listarFormulas,
  buscarFormulaPorId,
  crearFormula,
  actualizarFormula,
  eliminarFormula,
} from '../services/formulas.service.js';
import { validarFormula } from '../validators/formula.validator.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'CRUD basico',
  });
}

export async function obtenerFormulas(req, res, next) {
  try {
    const formulas = await listarFormulas();
    return res.status(200).json({ ok: true, formulas });
  } catch (error) {
    next(error);
  }
}

export async function obtenerFormulaPorId(req, res, next) {
  try {
    const { id } = req.params;
    const formula = await buscarFormulaPorId(id);

    if (!formula) {
      return res.status(404).json({ ok: false, message: `No existe una formula con id ${id}` });
    }

    return res.status(200).json({ ok: true, formula });
  } catch (error) {
    next(error);
  }
}

export async function crearNuevaFormula(req, res, next) {
  try {
    const { valido, errores } = validarFormula(req.body);

    if (!valido) {
      return res.status(400).json({ ok: false, errores });
    }

    const formula = await crearFormula(req.body);

    return res.status(201).json({ ok: true, formula });
  } catch (error) {
    next(error);
  }
}

export async function actualizarFormulaExistente(req, res, next) {
  try {
    const { id } = req.params;
    const { valido, errores } = validarFormula(req.body);

    if (!valido) {
      return res.status(400).json({ ok: false, errores });
    }

    const formula = await actualizarFormula(id, req.body);

    if (!formula) {
      return res.status(404).json({ ok: false, message: `No existe una formula con id ${id}` });
    }

    return res.status(200).json({ ok: true, formula });
  } catch (error) {
    next(error);
  }
}

export async function eliminarFormulaExistente(req, res, next) {
  try {
    const { id } = req.params;
    const eliminada = await eliminarFormula(id);

    if (!eliminada) {
      return res.status(404).json({ ok: false, message: `No existe una formula con id ${id}` });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
