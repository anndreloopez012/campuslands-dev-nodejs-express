import { ConflictError, NotFoundError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum } from '../validators/consulta.js';
import { REGIONES } from '../constants/juego.js';

const configListado = {
  filtros: {
    region: filtroEnum(REGIONES),
    buscar: (texto, error) => {
      const valor = texto.toLowerCase();
      if (valor.length < 1 || valor.length > 16) {
        error('debe tener entre 1 y 16 caracteres');
        return undefined;
      }
      return valor;
    },
  },
  ordenes: {
    id: (a, b) => a.id - b.id,
    nick: (a, b) => a.nick.localeCompare(b.nick),
    victorias: (a, b) => b.victorias - a.victorias || a.id - b.id,
    kills: (a, b) => b.kills - a.kills || a.id - b.id,
  },
  ordenPorDefecto: 'id',
};

export function crearJugadoresService({ repositorio, reloj = () => new Date() }) {
  const buscar = (id) => repositorio.buscar(id);

  function obtener(id) {
    const jugador = repositorio.buscar(id);
    if (!jugador) throw new NotFoundError(`No existe el jugador ${id}`, 'JUGADOR_NO_ENCONTRADO');
    return jugador;
  }

  function listar(query) {
    const consulta = leerListado(query, configListado);
    const { region, buscar: texto } = consulta.filtros;
    const filtrados = repositorio
      .listar((j) =>
        (region === undefined || j.region === region)
        && (texto === undefined || j.nick.toLowerCase().includes(texto)))
      .sort(consulta.comparador);
    return paginar(filtrados, consulta.pagina, consulta.limite);
  }

  function crear({ nick, region }) {
    if (repositorio.listar((j) => j.nick.toLowerCase() === nick.toLowerCase()).length) {
      throw new ConflictError(`Ya existe un jugador con el nick ${nick}`, 'NICK_DUPLICADO');
    }
    return repositorio.crear({ nick, region, partidas: 0, victorias: 0, kills: 0, creadoEn: reloj().toISOString() });
  }

  function registrarPartida(id, { gano, kills }) {
    const jugador = obtener(id);
    return repositorio.actualizar(id, {
      partidas: jugador.partidas + 1,
      victorias: jugador.victorias + (gano ? 1 : 0),
      kills: jugador.kills + kills,
    });
  }

  return { buscar, obtener, listar, crear, registrarPartida };
}
