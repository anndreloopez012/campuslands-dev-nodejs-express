import { normalizarClave } from './texto.js';

export class Catalogo {
  #canciones = new Map();
  #artistas = new Map();

  get cantidad() {
    return this.#canciones.size;
  }

  obtener(isrc) {
    return this.#canciones.get(isrc) ?? null;
  }

  todas() {
    return [...this.#canciones.values()];
  }

  artistas() {
    return [...this.#artistas.values()].map(({ nombre, cantidad }) => ({ nombre, canciones: cantidad }));
  }

  hayArtista(nombre) {
    return this.#artistas.has(normalizarClave(nombre));
  }

  nombreCanonico(nombre) {
    return this.#artistas.get(normalizarClave(nombre))?.nombre ?? nombre;
  }

  guardar(cancion) {
    const previa = this.#canciones.get(cancion.isrc);
    this.#canciones.set(cancion.isrc, cancion);
    this.#sumar(cancion.artista);
    if (previa) this.#restar(previa.artista);
  }

  eliminar(isrc) {
    const previa = this.#canciones.get(isrc);
    if (!previa) return;
    this.#canciones.delete(isrc);
    this.#restar(previa.artista);
  }

  aplicar(operaciones) {
    for (const operacion of operaciones) this.guardar(operacion.cancion);
  }

  revertir(deshacer, ahora) {
    let revertidas = 0;
    let omitidasPorCambios = 0;
    for (const paso of [...deshacer].reverse()) {
      const actual = this.#canciones.get(paso.isrc);
      if (!actual || actual.version !== paso.versionNueva) {
        omitidasPorCambios += 1;
      } else if (paso.tipo === 'crear') {
        this.eliminar(paso.isrc);
        revertidas += 1;
      } else {
        this.guardar({ ...paso.anterior, version: actual.version + 1, actualizadaEn: ahora });
        revertidas += 1;
      }
    }
    return { revertidas, omitidasPorCambios };
  }

  #sumar(nombre) {
    const clave = normalizarClave(nombre);
    const entrada = this.#artistas.get(clave);
    if (entrada) entrada.cantidad += 1;
    else this.#artistas.set(clave, { nombre, cantidad: 1 });
  }

  #restar(nombre) {
    const clave = normalizarClave(nombre);
    const entrada = this.#artistas.get(clave);
    entrada.cantidad -= 1;
    if (entrada.cantidad === 0) this.#artistas.delete(clave);
  }
}
