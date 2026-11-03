import { listarSaltos, registrarSalto } from '../services/saltos.service.js';
import { validarSalto } from '../validators/salto.validator.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'rutas POST',
  });
}

export function obtenerSaltos(req, res) {
  const saltos = listarSaltos();

  return res.status(200).json({ ok: true, saltos });
}

// Valida primero, y si todo esta bien, crea y
// responde 201 (Created), no 200, devolviendo el recurso creado.
export function crearSalto(req, res) {
  const { valido, errores } = validarSalto(req.body);

  if (!valido) {
    return res.status(400).json({ ok: false, errores });
  }

  const salto = registrarSalto(req.body);

  return res.status(201).json({ ok: true, salto });
}
