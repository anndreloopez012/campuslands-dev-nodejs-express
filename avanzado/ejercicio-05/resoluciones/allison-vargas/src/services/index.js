import { REINTENTOS, TIEMPO_MAXIMO_MS } from '../constants/futbol.js';
import { crearOperaciones } from '../domain/operaciones.js';
import { conIdempotencia } from '../domain/idempotencia.js';
import { sumaDeDinero, verificarInvariantes } from '../domain/invariantes.js';
import { crear, esErrorDeRegla } from '../errores/index.js';
import { Almacen } from '../tx/almacen.js';
import { loadJson } from '../utils/loadJson.js';
import { paginar } from '../utils/paginacion.js';

export function crearServicios({
  reloj = () => new Date(),
  pausa,
  datos = {
    clubes: loadJson('clubes.json'),
    jugadores: loadJson('jugadores.json'),
    agentes: loadJson('agentes.json'),
  },
  permitirFallos = true,
  reintentos = REINTENTOS,
  tiempoMaximoMs = TIEMPO_MAXIMO_MS,
} = {}) {
  const almacen = new Almacen({ iniciales: { fichajes: [], movimientos: [], idempotencia: [], ...datos }, reloj });
  const dineroInicial = sumaDeDinero(almacen);
  const operaciones = crearOperaciones({ reloj, pausa });
  const opciones = { reintentos, tiempoMaximoMs };

  const existe = (coleccion, id, codigo, campo) => {
    const registro = almacen.obtener(coleccion, id);
    if (!registro) throw crear(codigo, { [campo]: id });
    return registro;
  };

  async function simular(nombre, trabajo) {
    try {
      const { resultado, cambios } = await almacen.transaccion(nombre, trabajo, { ...opciones, simular: true });
      return { viable: true, resultado, cambios };
    } catch (error) {
      if (!esErrorDeRegla(error)) throw error;
      return { viable: false, error: { codigo: error.codigo, message: error.message, contexto: { ...error.contexto } } };
    }
  }

  const ordenar = (lista, pagina, limite) => paginar(lista, pagina, limite);

  return {
    permitirFallos,
    almacen,

    clubes: {
      listar: ({ modalidad, pagina, limite }) =>
        ordenar(almacen.consultar('clubes', (club) => !modalidad || club.modalidad === modalidad), pagina, limite),
      obtener(id) {
        const club = existe('clubes', id, 'CLUB_NO_ENCONTRADO', 'clubId');
        return { ...club, jugadores: almacen.consultar('jugadores', (jugador) => jugador.clubId === id) };
      },
    },

    jugadores: {
      listar({ clubId, modalidad, buscar, pagina, limite }) {
        const termino = buscar?.toLowerCase();
        const filtrados = almacen.consultar('jugadores', (jugador) =>
          (clubId === undefined || jugador.clubId === clubId)
          && (!modalidad || jugador.modalidad === modalidad)
          && (!termino || jugador.nombre.toLowerCase().includes(termino)));
        return ordenar(filtrados, pagina, limite);
      },
      obtener: (id) => existe('jugadores', id, 'JUGADOR_NO_ENCONTRADO', 'jugadorId'),
    },

    agentes: {
      listar: () => almacen.consultar('agentes'),
    },

    fichajes: {
      listar: ({ clubId, tipo, pagina, limite }) =>
        ordenar(almacen.consultar('fichajes', (fichaje) =>
          (clubId === undefined || fichaje.origenId === clubId || fichaje.destinoId === clubId)
          && (!tipo || fichaje.tipo === tipo)), pagina, limite),
      obtener: (id) => existe('fichajes', id, 'FICHAJE_NO_ENCONTRADO', 'fichajeId'),

      fichar: (cuerpo, clave) =>
        almacen.transaccion('fichar', (tx) =>
          conIdempotencia(tx, clave, cuerpo, () => operaciones.fichar(tx, cuerpo)), opciones),
      simularFichaje: (cuerpo) => simular('simular_fichar', (tx) => operaciones.fichar(tx, cuerpo)),

      intercambiar: (cuerpo, clave) =>
        almacen.transaccion('intercambiar', (tx) =>
          conIdempotencia(tx, clave, cuerpo, () => operaciones.intercambiar(tx, cuerpo)), opciones),
      simularIntercambio: (cuerpo) => simular('simular_intercambiar', (tx) => operaciones.intercambiar(tx, cuerpo)),
    },

    movimientos: {
      listar: ({ clubId, agenteId, fichajeId, pagina, limite }) =>
        ordenar(almacen.consultar('movimientos', (movimiento) =>
          (clubId === undefined || movimiento.clubId === clubId)
          && (agenteId === undefined || movimiento.agenteId === agenteId)
          && (fichajeId === undefined || movimiento.fichajeId === fichajeId)), pagina, limite),
    },

    transacciones: {
      listar: (filtros) => almacen.diario(filtros),
    },

    notificaciones: {
      listar: () => almacen.notificaciones(),
    },

    auditoria: {
      verificar() {
        const violaciones = verificarInvariantes(almacen, { dineroInicial });
        return {
          consistente: violaciones.length === 0,
          dinero: { inicial: dineroInicial, actual: sumaDeDinero(almacen) },
          violaciones,
        };
      },
    },
  };
}
