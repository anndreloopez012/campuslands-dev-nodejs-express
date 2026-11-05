import { REINTENTOS, TIEMPO_MAXIMO_MS } from '../constants/futbol.js';
import { crear } from '../errores/index.js';
import { Diario } from './diario.js';
import { Transaccion } from './transaccion.js';

export class Almacen {
  #colecciones = new Map();
  #secuencias = new Map();
  #notificaciones = [];
  #reloj;
  #diario;
  #siguienteTransaccion = 1;
  #siguienteNotificacion = 1;

  constructor({ iniciales = {}, reloj = () => new Date(), diario = new Diario() } = {}) {
    this.#reloj = reloj;
    this.#diario = diario;
    for (const [coleccion, registros] of Object.entries(iniciales)) {
      const mapa = new Map();
      let maximo = 0;
      for (const valor of registros) {
        mapa.set(String(valor.id), { valor: structuredClone(valor), version: 1 });
        if (typeof valor.id === 'number') maximo = Math.max(maximo, valor.id);
      }
      this.#colecciones.set(coleccion, mapa);
      this.#secuencias.set(coleccion, maximo + 1);
    }
  }

  #mapa(coleccion) {
    if (!this.#colecciones.has(coleccion)) this.#colecciones.set(coleccion, new Map());
    return this.#colecciones.get(coleccion);
  }

  reservarId(coleccion) {
    const siguiente = this.#secuencias.get(coleccion) ?? 1;
    this.#secuencias.set(coleccion, siguiente + 1);
    return siguiente;
  }

  leerRegistro(coleccion, id) {
    const registro = this.#mapa(coleccion).get(String(id));
    if (!registro) return { valor: null, version: 0 };
    return { valor: registro.valor === null ? null : structuredClone(registro.valor), version: registro.version };
  }

  obtener(coleccion, id) {
    return this.leerRegistro(coleccion, id).valor;
  }

  consultar(coleccion, predicado = () => true) {
    return [...this.#mapa(coleccion).values()]
      .filter((registro) => registro.valor !== null)
      .map((registro) => structuredClone(registro.valor))
      .filter(predicado)
      .sort((a, b) => (typeof a.id === 'number' && typeof b.id === 'number' ? a.id - b.id : String(a.id).localeCompare(String(b.id))));
  }

  instantanea() {
    return Object.fromEntries(
      [...this.#colecciones.keys()].sort().map((coleccion) => [coleccion, this.consultar(coleccion)]),
    );
  }

  notificaciones() {
    return structuredClone(this.#notificaciones);
  }

  diario(filtros) {
    return this.#diario.listar(filtros);
  }

  #confirmar(tx) {
    for (const base of tx.bases()) {
      const actual = this.leerRegistro(base.coleccion, base.id).version;
      if (actual !== base.version) {
        throw crear('CONFLICTO_DE_VERSION', {
          coleccion: base.coleccion,
          id: base.id,
          esperada: base.version,
          actual,
        });
      }
    }
    for (const escritura of tx.escrituras()) {
      const mapa = this.#mapa(escritura.coleccion);
      const version = (mapa.get(String(escritura.id))?.version ?? 0) + 1;
      mapa.set(String(escritura.id), { valor: escritura.valor, version });
    }
  }

  #anotar(nombre, tx, { id, intento, estado, error, inicio }) {
    const fin = this.#reloj();
    this.#diario.registrar({
      id,
      nombre,
      intento,
      estado,
      error: error ?? null,
      escrituras: tx.escrituras().map(({ coleccion, id: registro, tipo }) => ({ coleccion, id: registro, tipo })),
      lecturas: tx.bases().length,
      iniciadaEn: inicio.toISOString(),
      duracionMs: fin.getTime() - inicio.getTime(),
    });
  }

  async transaccion(nombre, trabajo, {
    reintentos = REINTENTOS,
    tiempoMaximoMs = TIEMPO_MAXIMO_MS,
    simular = false,
  } = {}) {
    let intento = 0;
    for (;;) {
      intento += 1;
      const id = this.#siguienteTransaccion++;
      const inicio = this.#reloj();
      const tx = new Transaccion({ almacen: this, reloj: this.#reloj, tiempoMaximoMs });
      try {
        const resultado = await trabajo(tx);
        tx.verificarTiempo();
        if (simular) {
          const cambios = tx.cambios();
          this.#anotar(nombre, tx, { id, intento, estado: 'simulada', inicio });
          return { resultado, cambios };
        }
        this.#confirmar(tx);
        for (const salida of tx.salidas()) {
          this.#notificaciones.push({
            id: this.#siguienteNotificacion++,
            tipo: salida.tipo,
            carga: salida.carga,
            transaccionId: id,
            en: this.#reloj().toISOString(),
          });
        }
        this.#anotar(nombre, tx, { id, intento, estado: 'confirmada', inicio });
        return resultado;
      } catch (error) {
        const conflicto = error?.codigo === 'CONFLICTO_DE_VERSION';
        this.#anotar(nombre, tx, {
          id,
          intento,
          estado: conflicto ? 'conflicto' : 'revertida',
          error: error?.codigo ?? error?.name ?? 'ERROR',
          inicio,
        });
        if (conflicto && intento <= reintentos) continue;
        throw error;
      }
    }
  }
}
