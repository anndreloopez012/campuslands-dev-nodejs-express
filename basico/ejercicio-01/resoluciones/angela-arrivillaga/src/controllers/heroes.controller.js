import { obtenerInfoRuntime, crearSaludo } from '../services/heroes.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'Node runtime y consola'
  });
}

export function runtime(req, res) {
  console.log('Pidieron la info del runtime');
  res.json({ ok: true, data: obtenerInfoRuntime() });
}

export function heroe(req, res) {
  const nombre = req.query.nombre;

  if (!nombre) {
    return res.status(400).json({ ok: false, message: 'Falta el nombre del heroe' });
  }

  console.log('Heroe recibido:', nombre);
  res.json({ ok: true, message: crearSaludo(nombre) });
}
