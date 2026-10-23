import { listarDibujos, crearDibujo } from '../services/dibujos.service.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'middleware express.json',
  });
}

export function obtenerDibujos(req, res) {
  const dibujos = listarDibujos();

  return res.status(200).json({ ok: true, dibujos });
}

// Esta ruta SI se beneficia de express.json() (ver app.js): req.body
// llega parseado como objeto JS normal.
export function crearNuevoDibujo(req, res) {
  const { nombre, capas, resolucion } = req.body || {};

  if (!nombre) {
    return res.status(400).json({
      ok: false,
      message: 'nombre es obligatorio (revisa que el body sea JSON valido)',
    });
  }

  const dibujo = crearDibujo({
    nombre,
    capas: capas ?? 1,
    resolucion: resolucion ?? '1920x1080',
  });

  return res.status(201).json({ ok: true, dibujo });
}

// Esta ruta se monta ANTES de express.json() en app.js, a proposito,
// para demostrar que sin el middleware req.body llega vacio aunque
// se mande JSON valido en la peticion.
export function crearDibujoSinMiddleware(req, res) {
  return res.status(200).json({
    ok: true,
    mensaje: 'Esta ruta NO tiene express.json() aplicado',
    tipo_de_body: typeof req.body,
    body_es_undefined: req.body === undefined,
  });
}
