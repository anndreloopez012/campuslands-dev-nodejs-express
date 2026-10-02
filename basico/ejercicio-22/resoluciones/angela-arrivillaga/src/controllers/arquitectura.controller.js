import { getProyectos, buscarProyecto } from '../services/proyectos.service.js';
import { calcularArea, calcularVolumen, calcularCosto } from '../services/calculos.service.js';

function esNumeroValido(valor) {
  return valor !== undefined && valor !== '' && !Number.isNaN(Number(valor)) && Number(valor) > 0;
}

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'servicios simples'
  });
}

export function listarProyectos(req, res) {
  res.json({ ok: true, data: getProyectos() });
}

export function obtenerProyecto(req, res) {
  const id = Number(req.params.id);
  const proyecto = buscarProyecto(id);

  if (!proyecto) {
    return res.status(404).json({ ok: false, message: 'Proyecto no encontrado' });
  }

  res.json({ ok: true, data: proyecto });
}

export function area(req, res) {
  if (!esNumeroValido(req.query.ancho) || !esNumeroValido(req.query.largo)) {
    return res.status(400).json({ ok: false, message: 'ancho y largo deben ser numeros mayores a 0' });
  }

  const resultado = calcularArea(Number(req.query.ancho), Number(req.query.largo));
  res.json({ ok: true, area: resultado, unidad: 'm2' });
}

export function volumen(req, res) {
  if (!esNumeroValido(req.query.ancho) || !esNumeroValido(req.query.largo) || !esNumeroValido(req.query.alto)) {
    return res.status(400).json({ ok: false, message: 'ancho, largo y alto deben ser numeros mayores a 0' });
  }

  const resultado = calcularVolumen(Number(req.query.ancho), Number(req.query.largo), Number(req.query.alto));
  res.json({ ok: true, volumen: resultado, unidad: 'm3' });
}

export function costo(req, res) {
  if (!esNumeroValido(req.query.ancho) || !esNumeroValido(req.query.largo) || !esNumeroValido(req.query.precio)) {
    return res.status(400).json({ ok: false, message: 'ancho, largo y precio deben ser numeros mayores a 0' });
  }

  const resultado = calcularCosto(Number(req.query.ancho), Number(req.query.largo), Number(req.query.precio));
  res.json({ ok: true, costo: resultado });
}
