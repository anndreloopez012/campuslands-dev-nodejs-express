import { crearVentanaFija, crearCubeta } from '../utils/limitadores.js';

export const limitadores = {
  lectura: crearVentanaFija({ limite: 10, ventanaMs: 10_000 }),
  escritura: crearCubeta({ capacidad: 3, recargaMs: 5_000 }),
  render: crearVentanaFija({ limite: 2, ventanaMs: 30_000 }),
};

export const descripciones = {
  lectura: 'Consultas de escenas',
  escritura: 'Creacion de escenas',
  render: 'Envio de renders (operacion costosa)',
};

setInterval(() => {
  Object.values(limitadores).forEach((limitador) => limitador.purgar());
}, 60_000).unref();
