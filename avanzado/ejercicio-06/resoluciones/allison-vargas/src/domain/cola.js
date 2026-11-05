import { randomUUID } from 'node:crypto';
import { ESTADOS, MAX_EXTENSIONES } from '../constants/taller.js';
import { crear } from '../errores/index.js';
import { retardoDeReintento } from './backoff.js';

const LIBRES = [ESTADOS.COMPLETADA, ESTADOS.CANCELADA];
const CANCELABLES = [ESTADOS.BLOQUEADA, ESTADOS.PROGRAMADA, ESTADOS.PENDIENTE];

const iso = (ms) => (ms === null ? null : new Date(ms).toISOString());

export class Cola {
  #trabajos = new Map();
  #claves = new Map();
  #siguienteId = 1;
  #reloj;
  #tipos;
  #generarToken;

  constructor({ reloj = () => new Date(), tipos, generarToken = randomUUID }) {
    this.#reloj = reloj;
    this.#tipos = tipos;
    this.#generarToken = generarToken;
  }

  #ahora() {
    return this.#reloj().getTime();
  }

  #registrar(trabajo, evento, datos = {}) {
    trabajo.historial.push({ n: trabajo.historial.length + 1, en: this.#ahora(), evento, ...datos });
    trabajo.actualizadoEn = this.#ahora();
  }

  #exigir(id) {
    const trabajo = this.#trabajos.get(id);
    if (!trabajo) throw crear('TRABAJO_NO_ENCONTRADO', { trabajoId: id });
    return trabajo;
  }

  #poner(trabajo, estado, evento, datos) {
    trabajo.estado = estado;
    if (estado === ESTADOS.PENDIENTE) trabajo.listaDesde = this.#ahora();
    this.#registrar(trabajo, evento, datos);
  }

  #programar(trabajo, retardoMs, evento, datos) {
    const ahora = this.#ahora();
    trabajo.disponibleMs = ahora + retardoMs;
    if (retardoMs > 0) this.#poner(trabajo, ESTADOS.PROGRAMADA, evento, { ...datos, hasta: trabajo.disponibleMs });
    else this.#poner(trabajo, ESTADOS.PENDIENTE, evento, datos);
  }

  #liberar(trabajo) {
    trabajo.trabajadorId = null;
    trabajo.token = null;
    trabajo.vencimientoMs = null;
  }

  #matar(trabajo, mensaje, evento) {
    this.#liberar(trabajo);
    trabajo.ultimoError = mensaje;
    this.#poner(trabajo, ESTADOS.MUERTA, evento, { mensaje });
  }

  #reprogramar(trabajo, mensaje, evento) {
    this.#liberar(trabajo);
    trabajo.ultimoError = mensaje;
    const retardo = retardoDeReintento(trabajo.intentos, this.#tipos[trabajo.tipo]);
    this.#programar(trabajo, retardo, evento, { mensaje, intento: trabajo.intentos, retardoMs: retardo });
  }

  #mantener() {
    const ahora = this.#ahora();
    let hubo = true;
    while (hubo) {
      hubo = false;
      for (const trabajo of this.#trabajos.values()) {
        if (trabajo.estado === ESTADOS.EN_PROCESO && trabajo.vencimientoMs <= ahora) {
          const mensaje = 'lease expirado sin respuesta del mecanico';
          if (trabajo.intentos >= trabajo.maxIntentos) this.#matar(trabajo, mensaje, 'lease_expirado');
          else this.#reprogramar(trabajo, mensaje, 'lease_expirado');
          hubo = true;
        } else if (trabajo.estado === ESTADOS.PROGRAMADA && trabajo.disponibleMs <= ahora) {
          this.#poner(trabajo, ESTADOS.PENDIENTE, 'lista');
          hubo = true;
        } else if (trabajo.estado === ESTADOS.BLOQUEADA) {
          const dependencias = trabajo.dependeDe.map((id) => this.#trabajos.get(id));
          const fallida = dependencias.find((d) => d.estado === ESTADOS.MUERTA || d.estado === ESTADOS.CANCELADA);
          if (fallida) {
            trabajo.canceladaPor = fallida.id;
            this.#poner(trabajo, ESTADOS.CANCELADA, 'cancelada_por_dependencia', { dependencia: fallida.id });
            hubo = true;
          } else if (dependencias.every((d) => d.estado === ESTADOS.COMPLETADA)) {
            this.#programar(trabajo, trabajo.retrasoMs, 'desbloqueada');
            hubo = true;
          }
        }
      }
    }
  }

  encolar({
    tipo,
    carga = {},
    prioridad = 2,
    retrasoMs = 0,
    maxIntentos,
    claveUnica = null,
    dependeDe = [],
    ordenId = null,
  }) {
    this.#mantener();
    if (claveUnica !== null && this.#claves.has(claveUnica)) {
      const existente = this.#trabajos.get(this.#claves.get(claveUnica));
      if (!LIBRES.includes(existente.estado)) return { trabajo: this.#vista(existente), duplicado: true };
    }
    for (const id of dependeDe) {
      const dependencia = this.#trabajos.get(id);
      if (!dependencia) throw crear('DEPENDENCIA_NO_ENCONTRADA', { trabajoId: id });
      if (dependencia.estado === ESTADOS.MUERTA || dependencia.estado === ESTADOS.CANCELADA) {
        throw crear('DEPENDENCIA_FALLIDA', { trabajoId: id, estado: dependencia.estado });
      }
    }
    const ahora = this.#ahora();
    const trabajo = {
      id: this.#siguienteId++,
      tipo,
      carga: structuredClone(carga),
      prioridad,
      estado: ESTADOS.PENDIENTE,
      intentos: 0,
      maxIntentos: maxIntentos ?? this.#tipos[tipo].maxIntentos,
      claveUnica,
      dependeDe: [...dependeDe],
      retrasoMs,
      ordenId,
      disponibleMs: ahora,
      listaDesde: null,
      trabajadorId: null,
      token: null,
      vencimientoMs: null,
      extensiones: 0,
      reclamadaEn: null,
      esperaMs: null,
      resultado: null,
      ultimoError: null,
      canceladaPor: null,
      creadoEn: ahora,
      actualizadoEn: ahora,
      historial: [],
    };
    this.#trabajos.set(trabajo.id, trabajo);
    if (claveUnica !== null) this.#claves.set(claveUnica, trabajo.id);
    this.#registrar(trabajo, 'creada');
    const esperando = dependeDe.some((id) => this.#trabajos.get(id).estado !== ESTADOS.COMPLETADA);
    if (esperando) this.#poner(trabajo, ESTADOS.BLOQUEADA, 'bloqueada', { dependeDe });
    else this.#programar(trabajo, retrasoMs, 'encolada');
    return { trabajo: this.#vista(trabajo), duplicado: false };
  }

  reclamar(trabajadorId, { tipos, max = 1 } = {}) {
    this.#mantener();
    const ahora = this.#ahora();
    const enProceso = new Map();
    for (const trabajo of this.#trabajos.values()) {
      if (trabajo.estado === ESTADOS.EN_PROCESO) enProceso.set(trabajo.tipo, (enProceso.get(trabajo.tipo) ?? 0) + 1);
    }
    const candidatos = [...this.#trabajos.values()]
      .filter((t) => t.estado === ESTADOS.PENDIENTE && (!tipos || tipos.includes(t.tipo)))
      .sort((a, b) => a.prioridad - b.prioridad || a.disponibleMs - b.disponibleMs || a.id - b.id);
    const reclamados = [];
    for (const trabajo of candidatos) {
      if (reclamados.length >= max) break;
      const config = this.#tipos[trabajo.tipo];
      if ((enProceso.get(trabajo.tipo) ?? 0) >= config.concurrencia) continue;
      enProceso.set(trabajo.tipo, (enProceso.get(trabajo.tipo) ?? 0) + 1);
      trabajo.intentos += 1;
      trabajo.trabajadorId = trabajadorId;
      trabajo.token = this.#generarToken();
      trabajo.vencimientoMs = ahora + config.leaseMs;
      trabajo.extensiones = 0;
      trabajo.reclamadaEn = ahora;
      trabajo.esperaMs = ahora - trabajo.listaDesde;
      this.#poner(trabajo, ESTADOS.EN_PROCESO, 'reclamada', { trabajadorId, intento: trabajo.intentos });
      reclamados.push(this.#vista(trabajo, { conToken: true }));
    }
    return reclamados;
  }

  #exigirReclamacion(id, token) {
    this.#mantener();
    const trabajo = this.#exigir(id);
    if (trabajo.estado !== ESTADOS.EN_PROCESO) {
      throw crear('TRABAJO_NO_EN_PROCESO', { trabajoId: id, estado: trabajo.estado });
    }
    if (trabajo.token !== token) throw crear('TOKEN_INVALIDO', { trabajoId: id });
    return trabajo;
  }

  completar(id, token, resultado = null) {
    const trabajo = this.#exigirReclamacion(id, token);
    this.#liberar(trabajo);
    trabajo.resultado = structuredClone(resultado);
    trabajo.ultimoError = null;
    this.#poner(trabajo, ESTADOS.COMPLETADA, 'completada');
    this.#mantener();
    return this.#vista(trabajo);
  }

  fallar(id, token, { mensaje = 'fallo sin detalle', definitivo = false } = {}) {
    const trabajo = this.#exigirReclamacion(id, token);
    if (definitivo || trabajo.intentos >= trabajo.maxIntentos) this.#matar(trabajo, mensaje, 'muerta');
    else this.#reprogramar(trabajo, mensaje, 'fallida');
    this.#mantener();
    return this.#vista(trabajo);
  }

  extender(id, token) {
    const trabajo = this.#exigirReclamacion(id, token);
    if (trabajo.extensiones >= MAX_EXTENSIONES) {
      throw crear('EXTENSIONES_AGOTADAS', { trabajoId: id, maximo: MAX_EXTENSIONES });
    }
    trabajo.extensiones += 1;
    trabajo.vencimientoMs = this.#ahora() + this.#tipos[trabajo.tipo].leaseMs;
    this.#registrar(trabajo, 'extendida', { extension: trabajo.extensiones, hasta: trabajo.vencimientoMs });
    return this.#vista(trabajo);
  }

  cancelar(id) {
    this.#mantener();
    const trabajo = this.#exigir(id);
    if (trabajo.estado === ESTADOS.EN_PROCESO) throw crear('TRABAJO_EN_PROCESO', { trabajoId: id });
    if (!CANCELABLES.includes(trabajo.estado)) {
      throw crear('TRABAJO_FINALIZADO', { trabajoId: id, estado: trabajo.estado });
    }
    trabajo.canceladaPor = null;
    this.#poner(trabajo, ESTADOS.CANCELADA, 'cancelada');
    this.#mantener();
    return this.#vista(trabajo);
  }

  reencolar(id) {
    this.#mantener();
    const trabajo = this.#exigir(id);
    if (trabajo.estado !== ESTADOS.MUERTA) {
      throw crear('TRABAJO_NO_MUERTO', { trabajoId: id, estado: trabajo.estado });
    }
    trabajo.intentos = 0;
    trabajo.extensiones = 0;
    this.#programar(trabajo, 0, 'reencolada');
    this.#restaurarDependientes(id);
    this.#mantener();
    return this.#vista(trabajo);
  }

  #restaurarDependientes(id) {
    for (const trabajo of this.#trabajos.values()) {
      if (trabajo.estado === ESTADOS.CANCELADA && trabajo.canceladaPor === id) {
        trabajo.canceladaPor = null;
        this.#poner(trabajo, ESTADOS.BLOQUEADA, 'restaurada', { dependencia: id });
        this.#restaurarDependientes(trabajo.id);
      }
    }
  }

  obtener(id) {
    this.#mantener();
    return this.#vista(this.#exigir(id), { conHistorial: true });
  }

  listar({ estado, tipo, ordenId, prioridad, trabajadorId } = {}) {
    this.#mantener();
    return [...this.#trabajos.values()]
      .filter((t) =>
        (!estado || t.estado === estado)
        && (!tipo || t.tipo === tipo)
        && (ordenId === undefined || t.ordenId === ordenId)
        && (prioridad === undefined || t.prioridad === prioridad)
        && (trabajadorId === undefined || t.trabajadorId === trabajadorId))
      .sort((a, b) => a.id - b.id)
      .map((t) => this.#vista(t));
  }

  estadisticas() {
    this.#mantener();
    const ahora = this.#ahora();
    const porEstado = Object.fromEntries(Object.values(ESTADOS).map((estado) => [estado, 0]));
    const porTipo = Object.fromEntries(Object.keys(this.#tipos).map((tipo) => [tipo, {
      pendientes: 0,
      enProceso: 0,
      limite: this.#tipos[tipo].concurrencia,
      completadas: 0,
      muertas: 0,
    }]));
    let esperas = 0;
    let atendidas = 0;
    let masAntigua = null;
    let reintentos = 0;
    for (const t of this.#trabajos.values()) {
      porEstado[t.estado] += 1;
      if (t.estado === ESTADOS.PENDIENTE) {
        porTipo[t.tipo].pendientes += 1;
        masAntigua = masAntigua === null ? t.listaDesde : Math.min(masAntigua, t.listaDesde);
      }
      if (t.estado === ESTADOS.EN_PROCESO) porTipo[t.tipo].enProceso += 1;
      if (t.estado === ESTADOS.COMPLETADA) porTipo[t.tipo].completadas += 1;
      if (t.estado === ESTADOS.MUERTA) porTipo[t.tipo].muertas += 1;
      if (t.esperaMs !== null) {
        esperas += t.esperaMs;
        atendidas += 1;
      }
      reintentos += Math.max(0, t.intentos - 1);
    }
    return {
      total: this.#trabajos.size,
      porEstado,
      porTipo,
      pendienteMasAntiguoMs: masAntigua === null ? null : ahora - masAntigua,
      esperaPromedioMs: atendidas === 0 ? null : Math.round(esperas / atendidas),
      reintentos,
    };
  }

  #vista(t, { conToken = false, conHistorial = false } = {}) {
    const vista = {
      id: t.id,
      tipo: t.tipo,
      carga: structuredClone(t.carga),
      prioridad: t.prioridad,
      estado: t.estado,
      intentos: t.intentos,
      maxIntentos: t.maxIntentos,
      claveUnica: t.claveUnica,
      dependeDe: [...t.dependeDe],
      ordenId: t.ordenId,
      trabajadorId: t.trabajadorId,
      disponibleEn: t.estado === ESTADOS.PROGRAMADA || t.estado === ESTADOS.PENDIENTE ? iso(t.disponibleMs) : null,
      venceEn: iso(t.vencimientoMs),
      extensiones: t.extensiones,
      resultado: t.resultado === null ? null : structuredClone(t.resultado),
      ultimoError: t.ultimoError,
      canceladaPor: t.canceladaPor,
      creadoEn: iso(t.creadoEn),
      actualizadoEn: iso(t.actualizadoEn),
    };
    if (conToken) vista.token = t.token;
    if (conHistorial) vista.historial = t.historial.map((h) => ({ ...h, en: iso(h.en) }));
    return vista;
  }
}
