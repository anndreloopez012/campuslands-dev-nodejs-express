import { Partida } from '../src/domain/partida.js';
import { AHORA, LOOT_FIJO, aparicionFija, jugador } from './datos.js';

export function crearPartida(opciones = {}) {
  return new Partida({
    id: 1,
    nombre: 'Isla de prueba',
    capacidad: 4,
    minimo: 2,
    reloj: () => AHORA,
    aparicion: aparicionFija,
    plantillaLoot: LOOT_FIJO,
    ...opciones,
  });
}

export function partidaIniciada({ jugadores = 2, ...opciones } = {}) {
  const partida = crearPartida(opciones);
  for (let id = 1; id <= jugadores; id += 1) partida.unirse(jugador(id));
  partida.iniciar();
  return partida;
}

export function lanzaDominio(codigo, contexto) {
  return (error) => {
    if (error.codigo !== codigo) return false;
    if (contexto) {
      for (const [clave, valor] of Object.entries(contexto)) {
        if (error.contexto[clave] !== valor) return false;
      }
    }
    return true;
  };
}
