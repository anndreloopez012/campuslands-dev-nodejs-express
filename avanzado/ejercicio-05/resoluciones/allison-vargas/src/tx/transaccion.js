import { crear } from '../errores/index.js';

const clave = (coleccion, id) => `${coleccion}:${id}`;

export class Transaccion {
  #almacen;
  #reloj;
  #inicio;
  #maximoMs;
  #escrituras = new Map();
  #bases = new Map();
  #salidas = [];
  #puntos = new Map();

  constructor({ almacen, reloj, tiempoMaximoMs }) {
    this.#almacen = almacen;
    this.#reloj = reloj;
    this.#inicio = reloj().getTime();
    this.#maximoMs = tiempoMaximoMs;
  }

  verificarTiempo() {
    if (this.#reloj().getTime() - this.#inicio > this.#maximoMs) {
      throw crear('TRANSACCION_EXPIRADA', { maximoMs: this.#maximoMs });
    }
  }

  #anotar(coleccion, id, version) {
    const k = clave(coleccion, id);
    if (!this.#bases.has(k)) this.#bases.set(k, { coleccion, id, version });
  }

  leer(coleccion, id) {
    this.verificarTiempo();
    const preparada = this.#escrituras.get(clave(coleccion, id));
    if (preparada) return preparada.valor === null ? null : structuredClone(preparada.valor);
    const registro = this.#almacen.leerRegistro(coleccion, id);
    this.#anotar(coleccion, id, registro.version);
    return registro.valor;
  }

  insertar(coleccion, datos, id) {
    this.verificarTiempo();
    const nuevoId = id ?? this.#almacen.reservarId(coleccion);
    if (this.leer(coleccion, nuevoId) !== null) {
      throw new TypeError(`Ya existe ${coleccion}/${nuevoId}`);
    }
    const valor = { ...structuredClone(datos), id: nuevoId };
    this.#escrituras.set(clave(coleccion, nuevoId), { coleccion, id: nuevoId, tipo: 'insertar', valor });
    return structuredClone(valor);
  }

  actualizar(coleccion, id, cambios) {
    this.verificarTiempo();
    const actual = this.leer(coleccion, id);
    if (actual === null) throw new TypeError(`No existe ${coleccion}/${id}`);
    const previa = this.#escrituras.get(clave(coleccion, id));
    const valor = { ...actual, ...structuredClone(cambios), id };
    this.#escrituras.set(clave(coleccion, id), {
      coleccion,
      id,
      tipo: previa?.tipo === 'insertar' ? 'insertar' : 'actualizar',
      valor,
    });
    return structuredClone(valor);
  }

  eliminar(coleccion, id) {
    this.verificarTiempo();
    const actual = this.leer(coleccion, id);
    if (actual === null) throw new TypeError(`No existe ${coleccion}/${id}`);
    const k = clave(coleccion, id);
    if (this.#escrituras.get(k)?.tipo === 'insertar') this.#escrituras.delete(k);
    else this.#escrituras.set(k, { coleccion, id, tipo: 'eliminar', valor: null });
  }

  encolar(tipo, carga) {
    this.#salidas.push({ tipo, carga: structuredClone(carga) });
  }

  puntoDeControl(nombre) {
    this.#puntos.set(nombre, {
      escrituras: structuredClone(this.#escrituras),
      salidas: this.#salidas.length,
    });
  }

  revertirA(nombre) {
    const punto = this.#puntos.get(nombre);
    if (!punto) throw new TypeError(`No existe el punto de control ${nombre}`);
    this.#escrituras = structuredClone(punto.escrituras);
    this.#salidas.length = punto.salidas;
  }

  bases() {
    return [...this.#bases.values()];
  }

  escrituras() {
    return [...this.#escrituras.values()].map((escritura) => ({
      coleccion: escritura.coleccion,
      id: escritura.id,
      tipo: escritura.tipo,
      valor: escritura.valor === null ? null : structuredClone(escritura.valor),
    }));
  }

  salidas() {
    return structuredClone(this.#salidas);
  }

  cambios() {
    return this.escrituras().map((escritura) => ({
      coleccion: escritura.coleccion,
      id: escritura.id,
      tipo: escritura.tipo,
      antes: this.#almacen.leerRegistro(escritura.coleccion, escritura.id).valor,
      despues: escritura.valor,
    }));
  }
}
