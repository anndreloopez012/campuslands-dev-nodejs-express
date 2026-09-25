// Controlador: a proposito NO usamos async/await aqui (eso ya se vio
// en el ejercicio 10). Encadenamos .then()/.catch() directamente sobre
// la Promise que devuelve el servicio, para practicar la sintaxis base
// de las promesas.

import { listarCanciones, buscarCancion } from '../services/musica.service.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'promesas basicas',
  });
}

export function obtenerCanciones(req, res) {
  listarCanciones()
    .then((canciones) => {
      res.status(200).json({ ok: true, canciones });
    })
    .catch((error) => {
      console.error('Error leyendo canciones:', error.message);
      res.status(500).json({
        ok: false,
        message: 'Ocurrio un error al leer las canciones',
      });
    });
}

export function obtenerCancionPorTitulo(req, res) {
  const { titulo } = req.params;

  buscarCancion(titulo)
    .then((cancion) => {
      res.status(200).json({ ok: true, cancion });
    })
    .catch((error) => {
      res.status(404).json({ ok: false, message: error.message });
    });
}
