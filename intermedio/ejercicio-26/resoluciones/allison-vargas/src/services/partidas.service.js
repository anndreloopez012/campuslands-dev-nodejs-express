import { randomBytes } from 'node:crypto';
import { NotFoundError, ReferenciaError, UnprocessableError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { promedio, puntosEnJuego } from '../utils/elo.js';
import { leerListado, filtroEnum, filtroEntero } from '../validators/consulta.js';
import { MAPAS, NOMBRES_MODOS } from '../constants/shooter.js';

const codigoAleatorio = () => randomBytes(3).toString('hex').toUpperCase();

const configListado = {
  filtros: {
    modo: filtroEnum(NOMBRES_MODOS),
    mapa: filtroEnum(MAPAS),
    jugadorId: filtroEntero(1, 1000000),
  },
  ordenes: {
    reciente: (a, b) => b.id - a.id,
    id: (a, b) => a.id - b.id,
  },
  ordenPorDefecto: 'reciente',
};

export function crearPartidasService({
  repositorio,
  jugadores,
  anticheat,
  notificador,
  reloj = () => new Date(),
  generarCodigo = codigoAleatorio,
}) {
  function obtener(id) {
    const partida = repositorio.buscar(id);
    if (!partida) throw new NotFoundError(`No existe la partida ${id}`, 'PARTIDA_NO_ENCONTRADA');
    return partida;
  }

  function listar(query) {
    const consulta = leerListado(query, configListado);
    const { modo, mapa, jugadorId } = consulta.filtros;
    const filtradas = repositorio
      .listar((p) =>
        (modo === undefined || p.modo === modo)
        && (mapa === undefined || p.mapa === mapa)
        && (jugadorId === undefined || p.equipoA.includes(jugadorId) || p.equipoB.includes(jugadorId)))
      .sort(consulta.comparador);
    return paginar(filtradas, consulta.pagina, consulta.limite);
  }

  function resolver(ids, campo) {
    return ids.map((id, posicion) => {
      const jugador = jugadores.buscar(id);
      if (!jugador) throw new ReferenciaError(`${campo}[${posicion}]`, `No existe el jugador ${id}`);
      return jugador;
    });
  }

  async function exigirLimpios(participantes) {
    const veredictos = await Promise.all(participantes.map((jugador) => anticheat.verificar(jugador.nick)));
    const sancionados = participantes
      .map((jugador, posicion) => ({ jugador, veredicto: veredictos[posicion] }))
      .filter(({ veredicto }) => !veredicto.limpio);
    if (sancionados.length) {
      throw new UnprocessableError(
        'Hay jugadores sancionados en la partida',
        'JUGADOR_SANCIONADO',
        sancionados.map(({ jugador, veredicto }) => ({
          campo: jugador.nick,
          mensaje: veredicto.motivo ?? 'jugador sancionado',
        })),
      );
    }
  }

  async function notificar(partida) {
    try {
      await notificador.enviar({
        tipo: 'partida_registrada',
        codigo: partida.codigo,
        modo: partida.modo,
        mapa: partida.mapa,
        ganador: partida.ganador,
      });
      return 'enviada';
    } catch {
      return 'fallida';
    }
  }

  async function registrar({ modo, mapa, equipoA, equipoB, ganador }) {
    const jugadoresA = resolver(equipoA, 'equipoA');
    const jugadoresB = resolver(equipoB, 'equipoB');
    await exigirLimpios([...jugadoresA, ...jugadoresB]);

    const eloA = promedio(jugadoresA.map((j) => j.elo));
    const eloB = promedio(jugadoresB.map((j) => j.elo));
    const gana = ganador === 'A';
    const puntos = puntosEnJuego(gana ? eloA : eloB, gana ? eloB : eloA);

    const cambios = [];
    const aplicar = (lista, ganaEquipo) => {
      for (const jugador of lista) {
        const delta = ganaEquipo ? puntos : -puntos;
        const actualizado = jugadores.registrarResultado(jugador.id, { delta, gano: ganaEquipo });
        cambios.push({
          jugadorId: jugador.id,
          antes: jugador.elo,
          despues: actualizado.elo,
          delta: actualizado.elo - jugador.elo,
        });
      }
    };
    aplicar(jugadoresA, gana);
    aplicar(jugadoresB, !gana);

    const partida = repositorio.crear({
      codigo: generarCodigo(),
      modo,
      mapa,
      equipoA,
      equipoB,
      ganador,
      cambios,
      registradaEn: reloj().toISOString(),
    });

    return { ...partida, notificacion: await notificar(partida) };
  }

  return { obtener, listar, registrar };
}
