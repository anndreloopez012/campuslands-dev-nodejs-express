import { crear } from '../domain/errores/index.js';
import { paginar } from '../utils/paginacion.js';

export function crearServicioDeJugadores({ repositorio, reloj }) {
  const buscarPorNick = (nick) =>
    repositorio.listar((jugador) => jugador.nick.toLowerCase() === nick.toLowerCase())[0] ?? null;

  return {
    listar({ buscar, pagina, limite }) {
      const termino = buscar?.toLowerCase();
      const filtrados = repositorio
        .listar((jugador) => !termino || jugador.nick.toLowerCase().includes(termino))
        .sort((a, b) => a.id - b.id);
      return paginar(filtrados, pagina, limite);
    },

    obtener(id) {
      const jugador = repositorio.buscar(id);
      if (!jugador) throw crear('JUGADOR_NO_ENCONTRADO', { jugadorId: id });
      return jugador;
    },

    registrar({ nick }) {
      if (buscarPorNick(nick)) throw crear('NICK_EN_USO', { nick });
      return repositorio.crear({ nick, suspendido: false, creadoEn: reloj().toISOString() });
    },
  };
}
