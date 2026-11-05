import { MemoryRepository } from '../repositories/memory.repository.js';
import { loadJson } from '../utils/loadJson.js';
import { leerConfig } from '../config/index.js';
import { crearDependencias } from '../config/dependencias.js';
import { crearJugadoresService } from './jugadores.service.js';
import { crearPartidasService } from './partidas.service.js';
import { crearSaludService } from './salud.service.js';
import { crearEventosService } from './eventos.service.js';

export function crearServicios({
  dependencias = crearDependencias(leerConfig()),
  reloj,
  generarCodigo,
} = {}) {
  const { anticheat, notificador, bitacora } = dependencias;

  const jugadores = crearJugadoresService({
    repositorio: new MemoryRepository(loadJson('jugadores.json')),
    reloj,
  });
  const partidas = crearPartidasService({
    repositorio: new MemoryRepository(),
    jugadores,
    anticheat,
    notificador,
    reloj,
    generarCodigo,
  });
  const salud = crearSaludService({ anticheat, notificador });
  const eventos = crearEventosService({ bitacora });

  return { jugadores, partidas, salud, eventos };
}
