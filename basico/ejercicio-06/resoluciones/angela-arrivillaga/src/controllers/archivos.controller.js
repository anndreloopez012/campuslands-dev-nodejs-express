import { listarArchivos, leerArchivoSeguro, obtenerInfoRuta } from '../services/archivos.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'path y rutas seguras'
  });
}

export function listar(req, res) {
  res.json({ ok: true, data: listarArchivos() });
}

export function leer(req, res) {
  const resultado = leerArchivoSeguro(req.params.nombre);

  if (resultado.error === 'invalido') {
    return res.status(400).json({ ok: false, message: 'Ruta no permitida' });
  }

  if (resultado.error === 'noexiste') {
    return res.status(404).json({ ok: false, message: 'El archivo no existe' });
  }

  res.json({ ok: true, nombre: req.params.nombre, contenido: resultado.contenido });
}

export function infoRuta(req, res) {
  const ruta = req.query.ruta;

  if (!ruta) {
    return res.status(400).json({ ok: false, message: 'Falta el parametro ruta' });
  }

  res.json({ ok: true, data: obtenerInfoRuta(ruta) });
}
