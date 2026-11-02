import { getArmas, existeArma, agregarArma, borrarArma, getEstados } from '../services/estados.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'codigos de estado'
  });
}

export function listarArmas(req, res) {
  res.status(200).json({ ok: true, data: getArmas() });
}

export function crearArma(req, res) {
  const body = req.body || {};

  if (typeof body.nombre !== 'string' || body.nombre.trim() === '') {
    return res.status(400).json({ ok: false, message: 'El nombre es obligatorio' });
  }

  if (typeof body.dano !== 'number' || body.dano <= 0) {
    return res.status(400).json({ ok: false, message: 'El dano debe ser un numero mayor a 0' });
  }

  if (existeArma(body.nombre.trim())) {
    return res.status(409).json({ ok: false, message: 'Ya existe un arma con ese nombre' });
  }

  const nueva = agregarArma(body.nombre.trim(), body.dano);
  res.status(201).json({ ok: true, data: nueva });
}

export function eliminarArma(req, res) {
  const id = Number(req.params.id);
  const eliminada = borrarArma(id);

  if (!eliminada) {
    return res.status(404).json({ ok: false, message: 'Arma no encontrada' });
  }

  res.status(204).send();
}

export function probarEstado(req, res) {
  const codigo = Number(req.params.codigo);
  const estados = getEstados();
  const estado = estados[codigo];

  if (!estado) {
    return res.status(400).json({ ok: false, message: 'Codigo no disponible. Usa 200, 201, 204, 400, 401, 404, 409 o 500' });
  }

  if (codigo === 204) {
    return res.status(204).send();
  }

  res.status(codigo).json({
    ok: codigo < 400,
    codigo: codigo,
    nombre: estado.nombre,
    descripcion: estado.descripcion
  });
}
