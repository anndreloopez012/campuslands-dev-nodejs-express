import { ESTADOS } from '../constants/juego.js';
import { Partida } from '../domain/partida.js';
import { esErrorDeDominio, crear } from '../domain/errores/index.js';
import { aProblema } from '../http/problemas.js';
import { paginar } from '../utils/paginacion.js';

export function crearServicioDePartidas({ repositorio, jugadores, reloj, aparicion, plantillaLoot, iniciales = [] }) {
  const construir = (datos) => new Partida({ reloj, aparicion, plantillaLoot, ...datos });

  iniciales.forEach((datos) => repositorio.guardar(construir(datos)));

  const obtener = (id) => {
    const partida = repositorio.buscar(id);
    if (!partida) throw crear('PARTIDA_NO_ENCONTRADA', { partidaId: id });
    return partida;
  };

  const partidaActivaDe = (jugadorId) =>
    repositorio.listar((partida) => partida.estado !== ESTADOS.TERMINADA && partida.jugadores.has(jugadorId))[0]?.id ?? null;

  const ejecutores = {
    mover: (partida, a) => partida.mover(a.jugadorId, { x: a.x, y: a.y }),
    recoger: (partida, a) => partida.recoger(a.jugadorId, a.objetoId),
    disparar: (partida, a) => partida.disparar(a.atacanteId, a.objetivoId, a.arma),
    curar: (partida, a) => partida.curar(a.jugadorId),
  };

  return {
    listar({ estado, pagina, limite }) {
      const filtradas = repositorio
        .listar((partida) => !estado || partida.estado === estado)
        .sort((a, b) => a.id - b.id)
        .map((partida) => partida.aJSON());
      return paginar(filtradas, pagina, limite);
    },

    obtener: (id) => obtener(id).aJSON({ detalle: true }),

    crear(datos) {
      const partida = construir({ id: repositorio.reservarId(), ...datos });
      repositorio.guardar(partida);
      return partida.aJSON({ detalle: true });
    },

    unirse(id, { jugadorId }) {
      const partida = obtener(id);
      const jugador = jugadores.obtener(jugadorId);
      partida.unirse(jugador, { partidaActivaId: partidaActivaDe(jugadorId) });
      return partida.aJSON({ detalle: true });
    },

    salir(id, { jugadorId }) {
      const partida = obtener(id);
      partida.salir(jugadorId);
      return partida.aJSON({ detalle: true });
    },

    iniciar(id) {
      const partida = obtener(id);
      partida.iniciar();
      return partida.aJSON({ detalle: true });
    },

    mover: (id, datos) => obtener(id).mover(datos.jugadorId, { x: datos.x, y: datos.y }),
    recoger: (id, datos) => obtener(id).recoger(datos.jugadorId, datos.objetoId),
    disparar: (id, datos) => obtener(id).disparar(datos.atacanteId, datos.objetivoId, datos.arma),
    curar: (id, datos) => obtener(id).curar(datos.jugadorId),
    avanzarZona: (id) => obtener(id).avanzarZona(),

    eventos: (id) => obtener(id).eventos(),

    ejecutarLote(id, { acciones, detenerEnError }, contexto) {
      const partida = obtener(id);
      const resultados = [];
      let detenido = false;
      acciones.forEach((accion, indice) => {
        if (detenido) {
          resultados.push({ indice, tipo: accion.tipo, estado: 'omitida' });
          return;
        }
        try {
          const resultado = ejecutores[accion.tipo](partida, accion);
          resultados.push({ indice, tipo: accion.tipo, estado: 'ok', resultado });
        } catch (error) {
          if (!esErrorDeDominio(error)) throw error;
          const { cuerpo } = aProblema(error, contexto);
          resultados.push({ indice, tipo: accion.tipo, estado: 'error', problema: cuerpo });
          if (detenerEnError) detenido = true;
        }
      });
      const cuenta = (estado) => resultados.filter((r) => r.estado === estado).length;
      return {
        resultados,
        resumen: { ok: cuenta('ok'), error: cuenta('error'), omitidas: cuenta('omitida') },
        partida: partida.aJSON(),
      };
    },
  };
}
