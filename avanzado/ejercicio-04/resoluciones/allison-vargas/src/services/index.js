import { loadJson } from '../utils/loadJson.js';
import { MemoryRepository } from '../repositories/memory.repository.js';
import { RepositorioDePartidas } from '../repositories/partidas.repository.js';
import { aparicionEnCirculo } from '../domain/geometria.js';
import { crearServicioDeJugadores } from './jugadores.service.js';
import { crearServicioDePartidas } from './partidas.service.js';

export function crearServicios({
  reloj = () => new Date(),
  aparicion = aparicionEnCirculo,
  plantillaLoot = loadJson('loot.json'),
  jugadoresIniciales = loadJson('jugadores.json'),
  partidasIniciales = loadJson('partidas.json'),
  repositorioDePartidas = new RepositorioDePartidas(),
} = {}) {
  const jugadores = crearServicioDeJugadores({
    repositorio: new MemoryRepository(jugadoresIniciales),
    reloj,
  });
  const partidas = crearServicioDePartidas({
    repositorio: repositorioDePartidas,
    jugadores,
    reloj,
    aparicion,
    plantillaLoot,
    iniciales: partidasIniciales,
  });
  return { jugadores, partidas };
}
