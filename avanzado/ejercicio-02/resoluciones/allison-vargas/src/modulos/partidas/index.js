import { MemoryRepository } from '../../repositories/memory.repository.js';
import { EVENTOS } from '../../constants/dominio.js';
import { crearPartidasService } from './partidas.service.js';
import { crearPartidasRouter } from './partidas.routes.js';

export default {
  nombre: 'partidas',
  ruta: '/partidas',
  dependencias: ['jugadores'],
  emite: [EVENTOS.PARTIDA_FINALIZADA],
  escucha: [],

  registrar(contenedor) {
    contenedor.registrar('partidas.repositorio', () => new MemoryRepository());
    contenedor.registrar('partidas', (c) => crearPartidasService({
      repositorio: c.resolver('partidas.repositorio'),
      jugadores: c.resolver('jugadores'),
      eventos: c.resolver('eventos'),
      reloj: c.resolver('reloj'),
    }));
  },

  crearRouter(contenedor) {
    return crearPartidasRouter({ partidas: contenedor.resolver('partidas') });
  },

  estado(contenedor) {
    return { ok: true, detalle: { partidas: contenedor.resolver('partidas').contar() } };
  },
};
