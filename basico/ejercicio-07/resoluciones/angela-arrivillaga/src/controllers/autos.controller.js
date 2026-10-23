import { getAutos, buscarPorMarca } from '../services/autos.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'process.argv y CLI'
  });
}

export function listar(req, res) {
  const marca = req.query.marca;

  if (!marca) {
    return res.json({ ok: true, data: getAutos() });
  }

  const encontrados = buscarPorMarca(marca);

  if (encontrados.length === 0) {
    return res.status(404).json({ ok: false, message: 'No hay autos de esa marca' });
  }

  res.json({ ok: true, data: encontrados });
}
