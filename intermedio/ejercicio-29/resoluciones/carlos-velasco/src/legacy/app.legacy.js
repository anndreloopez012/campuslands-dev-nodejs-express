/**
 * VERSION LEGACY (guardada como referencia del "antes").
 *
 * Antipatrones tipicos que motivaron el refactor:
 * 1. Todo en un solo archivo: rutas, validacion, negocio y datos mezclados.
 * 2. Duplicacion: la misma validacion copiada en dos rutas.
 * 3. Codigos HTTP inconsistentes: 200 para errores, 500 manual.
 * 4. IDs asignados con longitudes de array (colisionan al borrar).
 * 5. Sin capa de errores: stuck de try/catch inconveniente en cada ruta.
 *
 * El comportamiento EXTERNO es lo que PODRIAS igualar (contrato del curso):
 * misma forma de respuesta { ok, message, data } y misma semantica de status.
 *
 * Este archivo NO se ejecuta: es el antes para comparar en el diagrama del README.
 */
const express = require('express');

const LEGACY_ESQUEMA = `
const express = require('express');
const app = express();
app.use(express.json());

let jugadores = [];
let equipos = [];

// TODO en un handler: ruta + validacion + negocio + datos
app.post('/equipos', (req, res) => {
  const { city, nombre } = req.body;
  if (!nombre) {
    // bug 1: error con 200
    return res.json({ ok: false, mensaje: 'falta nombre' });
  }
  // bug 2: asignacion por longitud
  const equipo = { id: equipos.length + 1, nombre, city };
  equipos.push(equipo);
  res.status(201).json({ ok: true, message: 'creado', data: equipo });
});

app.get('/equipos', (req, res) => {
  // bug 3: filtrado instalado en la ruta, duplicado en la ruta de detalle
  let data = equipos;
  if (req.query.city) data = equipos.filter((e) => e.city === req.query.city);
  res.json({ ok: true, data });
});

app.post('/equipos/:id/jugadores', (req, res) => {
  // bug 4: validacion duplicada (otra copia del if de nombre)
  const equipo = equipos.find((e) => e.id === Number(req.params.id));
  if (!equipo) {
    // bug 5: axios-style algebra con codigos
    return res.status(500).json({ ok: false, mensaje: 'no encontrado' }); // deberia ser 404
  }
  const jugador = { id: jugadores.length + 1, equipoId: equipo.id, nombre: req.body.nombre };
  jugadores.push(jugador);
  res.json({ ok: true, data: jugador }); // deberia ser 201
});

app.listen(3000);
`;

module.exports = { LEGACY_ESQUEMA };
