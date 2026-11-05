import { MemoryRepository } from '../../repositories/memory.repository.js';
import { loadJson } from '../../utils/loadJson.js';
import { EVENTOS } from '../../constants/dominio.js';
import { crearJugadoresService } from './jugadores.service.js';
import { crearJugadoresRouter } from './jugadores.routes.js';

export default {
  nombre: 'jugadores',
  ruta: '/jugadores',
  dependencias: [],
  emite: [EVENTOS.JUGADOR_CREADO],
  escucha: [],

  registrar(contenedor) {
    contenedor.registrar('jugadores.repositorio', () => new MemoryRepository(loadJson('jugadores.json')));
    contenedor.registrar('jugadores', (c) => crearJugadoresService({
      repositorio: c.resolver('jugadores.repositorio'),
      eventos: c.resolver('eventos'),
      reloj: c.resolver('reloj'),
    }));
  },

  crearRouter(contenedor) {
    return crearJugadoresRouter({ jugadores: contenedor.resolver('jugadores') });
  },

  estado(contenedor) {
    return { ok: true, detalle: { jugadores: contenedor.resolver('jugadores').contar() } };
  },
};
