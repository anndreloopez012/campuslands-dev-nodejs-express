import { ConflictError, NotFoundError, ValidationError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum } from '../validators/consulta.js';
import { ELO_INICIAL, REGIONES } from '../constants/shooter.js';

const NICK_VALIDO = /^[A-Za-z0-9_]+$/;
const porElo = (a, b) => b.elo - a.elo || a.id - b.id;

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
    elo: porElo,
  },
  ordenPorDefecto: 'id',
};

const configRanking = {
  filtros: { region: filtroEnum(REGIONES) },
  ordenes: { elo: porElo },
  ordenPorDefecto: 'elo',
  limiteDefault: 5,
  limiteMax: 10,
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

  function ranking(query) {
    const consulta = leerListado(query, configRanking);
    const { region } = consulta.filtros;
    const filtrados = repositorio
      .listar((j) => region === undefined || j.region === region)
      .sort(consulta.comparador);
    return paginar(filtrados, consulta.pagina, consulta.limite);
  }

  function crear({ nick, region }) {
    if (!NICK_VALIDO.test(nick)) {
      throw new ValidationError('Datos invalidos', [{ campo: 'nick', mensaje: 'solo admite letras, numeros y guion bajo' }]);
    }
    if (repositorio.listar((j) => j.nick.toLowerCase() === nick.toLowerCase()).length) {
      throw new ConflictError(`Ya existe un jugador con el nick ${nick}`, 'NICK_DUPLICADO');
    }
    return repositorio.crear({
      nick,
      region,
      elo: ELO_INICIAL,
      partidas: 0,
      victorias: 0,
      creadoEn: reloj().toISOString(),
    });
  }

  function registrarResultado(id, { delta, gano }) {
    const jugador = obtener(id);
    return repositorio.actualizar(id, {
      elo: Math.max(0, jugador.elo + delta),
      partidas: jugador.partidas + 1,
      victorias: jugador.victorias + (gano ? 1 : 0),
    });
  }

  return { buscar, obtener, listar, ranking, crear, registrarResultado };
}
