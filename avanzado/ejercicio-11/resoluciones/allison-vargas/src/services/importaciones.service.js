import { createHash } from 'node:crypto';
import {
  CAMPOS_COMPARABLES, ESTADOS, LIMITES, TERMINALES,
} from '../constants/musica.js';
import { crear } from '../errores/index.js';
import { normalizarClave } from '../domain/texto.js';
import { paginar } from '../utils/paginacion.js';
import { validarCancion } from '../validators/cancion.js';

const esperaPorDefecto = () => new Promise((resolver) => { setImmediate(resolver); });

const vista = (job) => ({
  id: job.id,
  estado: job.estado,
  modo: job.opciones.modo,
  conflicto: job.opciones.conflicto,
  tamanoLote: job.opciones.tamanoLote,
  dryRun: job.opciones.dryRun,
  formato: job.formato,
  total: job.entradas.length,
  procesadas: job.procesadas,
  porcentaje: job.entradas.length ? Math.round((job.procesadas / job.entradas.length) * 100) : 100,
  contadores: { ...job.contadores },
  lotes: { total: job.lotesTotales, completados: job.lotesCompletados },
  artistasNuevos: job.artistasNuevos,
  rechazosGuardados: job.rechazos.length,
  rechazosOmitidos: job.rechazosOmitidos,
  cancelacionSolicitada: job.cancelacionSolicitada,
  revertida: job.revertida,
  motivo: job.motivo,
  claveDeIdempotencia: job.clave,
  creadaEn: job.creadaEn,
  iniciadaEn: job.iniciadaEn,
  finalizadaEn: job.finalizadaEn,
});

export function crearServicioImportaciones({
  catalogo, reloj, cederTurno = esperaPorDefecto, registro = () => {},
}) {
  const trabajos = [];
  const porClave = new Map();
  const cola = [];
  const esperas = new Map();
  let corriendo = false;

  const ahora = () => reloj().toISOString();
  const anioMaximo = () => reloj().getUTCFullYear();

  const buscar = (id) => {
    const job = trabajos.find((t) => t.id === id);
    if (!job) throw crear('IMPORTACION_NO_ENCONTRADA', { importacionId: id });
    return job;
  };

  function terminar(job, estado, motivo = null) {
    job.estado = estado;
    job.motivo = motivo;
    job.finalizadaEn = ahora();
    esperas.get(job.id)?.();
  }

  function rechazar(job, entrada, errores) {
    job.contadores.rechazadas += 1;
    if (job.rechazos.length < LIMITES.rechazosGuardados) {
      job.rechazos.push({ fila: entrada.fila, errores, datos: entrada.dato ?? entrada.textoCrudo ?? null });
    } else {
      job.rechazosOmitidos += 1;
    }
  }

  function procesarEntrada(job, entrada, contexto) {
    if (entrada.errorDeLectura) return rechazar(job, entrada, [{ campo: 'fila', mensaje: entrada.errorDeLectura }]);
    const resultado = validarCancion(entrada.dato, { anioMaximo: contexto.anioMaximo });
    if (resultado.errores) return rechazar(job, entrada, resultado.errores);

    const nueva = resultado.valor;
    const claveArtista = normalizarClave(nueva.artista);
    let artista = contexto.artistas.get(claveArtista);
    if (artista === undefined) {
      artista = catalogo.nombreCanonico(nueva.artista);
      if (!catalogo.hayArtista(nueva.artista)) job.artistasNuevos += 1;
      contexto.artistas.set(claveArtista, artista);
    }
    const propuesta = { ...nueva, artista };
    const existente = contexto.canciones.get(propuesta.isrc) ?? catalogo.obtener(propuesta.isrc);

    if (!existente) {
      const cancion = {
        ...propuesta, version: 1, creadaEn: contexto.ahora, actualizadaEn: contexto.ahora, importacionId: job.id,
      };
      contexto.canciones.set(cancion.isrc, cancion);
      contexto.pendientes.push({ tipo: 'crear', cancion });
      job.contadores.creadas += 1;
      return undefined;
    }
    if (job.opciones.conflicto === 'fallar') {
      return rechazar(job, entrada, [{ campo: 'isrc', mensaje: 'ya existe una cancion con ese ISRC' }]);
    }
    const igual = CAMPOS_COMPARABLES.every((campo) => existente[campo] === propuesta[campo]);
    if (job.opciones.conflicto === 'omitir' || igual) {
      job.contadores.omitidas += 1;
      return undefined;
    }
    const cancion = {
      ...existente, ...propuesta, version: existente.version + 1, actualizadaEn: contexto.ahora, importacionId: job.id,
    };
    contexto.canciones.set(cancion.isrc, cancion);
    contexto.pendientes.push({ tipo: 'actualizar', anterior: existente, cancion });
    job.contadores.actualizadas += 1;
    return undefined;
  }

  function confirmar(job, operaciones) {
    if (job.opciones.dryRun || operaciones.length === 0) return;
    catalogo.aplicar(operaciones);
    for (const op of operaciones) {
      job.deshacer.push({
        tipo: op.tipo, isrc: op.cancion.isrc, anterior: op.anterior, versionNueva: op.cancion.version,
      });
    }
  }

  async function ejecutar(job) {
    await cederTurno();
    if (job.estado === 'cancelada') return;
    job.estado = 'procesando';
    job.iniciadaEn = ahora();
    const contexto = {
      canciones: new Map(), artistas: new Map(), pendientes: [], anioMaximo: anioMaximo(), ahora: ahora(),
    };
    const todoONada = job.opciones.modo === 'todo-o-nada';
    const acumuladas = [];
    let confirmadasEnLotes = 0;

    for (let inicio = 0; inicio < job.entradas.length; inicio += job.opciones.tamanoLote) {
      if (job.cancelacionSolicitada) break;
      for (const entrada of job.entradas.slice(inicio, inicio + job.opciones.tamanoLote)) {
        procesarEntrada(job, entrada, contexto);
        job.procesadas += 1;
      }
      if (todoONada) {
        acumuladas.push(...contexto.pendientes);
      } else {
        confirmar(job, contexto.pendientes);
        confirmadasEnLotes += contexto.pendientes.length;
      }
      contexto.pendientes = [];
      job.lotesCompletados += 1;
      if (inicio + job.opciones.tamanoLote < job.entradas.length) await cederTurno();
    }

    if (job.cancelacionSolicitada) {
      if (todoONada) {
        job.contadores.descartadas = job.contadores.creadas + job.contadores.actualizadas;
        job.contadores.creadas = 0;
        job.contadores.actualizadas = 0;
        return terminar(job, 'cancelada', 'cancelada antes de aplicar; no se guardo ningun cambio');
      }
      return terminar(job, 'cancelada', `cancelada; se conservaron ${confirmadasEnLotes} cambios de los lotes ya terminados`);
    }
    if (todoONada && job.contadores.rechazadas > 0) {
      job.contadores.descartadas = job.contadores.creadas + job.contadores.actualizadas;
      job.contadores.creadas = 0;
      job.contadores.actualizadas = 0;
      return terminar(job, 'fallida', 'hay filas rechazadas y el modo es todo-o-nada; no se guardo ningun cambio');
    }
    if (todoONada) confirmar(job, acumuladas);
    return terminar(job, 'completada');
  }

  async function drenar() {
    if (corriendo) return;
    corriendo = true;
    while (cola.length > 0) {
      const job = cola.shift();
      try {
        await ejecutar(job);
      } catch (error) {
        registro({ nivel: 'error', mensaje: error?.message, pila: error?.stack, importacionId: job.id });
        terminar(job, 'fallida', 'error interno al procesar la importacion');
      }
    }
    corriendo = false;
  }

  function huella(formato, opciones, entradas) {
    return createHash('sha256').update(JSON.stringify({ formato, opciones, entradas })).digest('hex');
  }

  return {
    crear({ entradas, formato, opciones, clave }) {
      const hash = huella(formato, opciones, entradas);
      if (clave && porClave.has(clave)) {
        const previo = porClave.get(clave);
        if (previo.hash !== hash) throw crear('CLAVE_DE_IDEMPOTENCIA_REUTILIZADA', { clave });
        return { importacion: vista(previo.job), repetida: true };
      }
      if (cola.length >= LIMITES.pendientesEnCola) {
        throw crear('COLA_LLENA', {}, { cabeceras: { 'Retry-After': String(LIMITES.reintentoSegundos) } });
      }
      const job = {
        id: trabajos.length + 1,
        estado: 'en_cola',
        formato,
        opciones,
        clave,
        entradas,
        procesadas: 0,
        contadores: {
          creadas: 0, actualizadas: 0, omitidas: 0, rechazadas: 0, descartadas: 0,
        },
        lotesTotales: Math.ceil(entradas.length / opciones.tamanoLote),
        lotesCompletados: 0,
        artistasNuevos: 0,
        rechazos: [],
        rechazosOmitidos: 0,
        deshacer: [],
        cancelacionSolicitada: false,
        revertida: false,
        motivo: null,
        creadaEn: ahora(),
        iniciadaEn: null,
        finalizadaEn: null,
      };
      trabajos.push(job);
      if (clave) porClave.set(clave, { hash, job });
      cola.push(job);
      drenar();
      return { importacion: vista(job), repetida: false };
    },

    esperar(id) {
      const job = buscar(id);
      if (TERMINALES.includes(job.estado)) return Promise.resolve(vista(job));
      return new Promise((resolver) => {
        const previa = esperas.get(id);
        esperas.set(id, () => {
          previa?.();
          resolver(vista(job));
        });
      });
    },

    obtener: (id) => vista(buscar(id)),

    listar({ pagina, limite, estado }) {
      const lista = [...trabajos].reverse().filter((t) => !estado || t.estado === estado).map(vista);
      return paginar(lista, pagina, limite);
    },

    rechazos(id, { pagina, limite }) {
      return paginar(buscar(id).rechazos, pagina, limite);
    },

    todosLosRechazos: (id) => buscar(id).rechazos,

    cancelar(id) {
      const job = buscar(id);
      if (TERMINALES.includes(job.estado)) throw crear('IMPORTACION_FINALIZADA', { importacionId: id, estado: job.estado });
      job.cancelacionSolicitada = true;
      if (job.estado === 'en_cola') {
        const posicion = cola.indexOf(job);
        if (posicion >= 0) cola.splice(posicion, 1);
        terminar(job, 'cancelada', 'cancelada antes de empezar');
      }
      return vista(job);
    },

    revertir(id) {
      const job = buscar(id);
      const rechazo = (motivo) => crear('IMPORTACION_NO_REVERTIBLE', { importacionId: id, motivo });
      if (!TERMINALES.includes(job.estado)) throw rechazo('todavia no termino');
      if (job.revertida) throw rechazo('ya fue revertida');
      if (job.deshacer.length === 0) throw rechazo('no aplico ningun cambio');
      const resultado = catalogo.revertir(job.deshacer, ahora());
      job.revertida = true;
      return { importacion: vista(job), ...resultado };
    },

    estados: ESTADOS,
  };
}
