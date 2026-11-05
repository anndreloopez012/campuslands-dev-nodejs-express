import { normalizarClave } from './texto.js';

export const claveDePartido = (p) => {
  const par = [normalizarClave(p.local), normalizarClave(p.visita)].sort().join('|');
  return `${p.fecha}|${par}|${normalizarClave(p.torneo)}`;
};

export class AlmacenDePartidos {
  #partidos = [];
  #claves = new Set();
  #importaciones = [];
  #siguientePartido = 1;
  #siguienteImportacion = 1;

  get partidos() {
    return this.#partidos;
  }

  get importaciones() {
    return this.#importaciones;
  }

  existe(partido) {
    return this.#claves.has(claveDePartido(partido));
  }

  obtenerPartido(id) {
    return this.#partidos.find((p) => p.id === id) ?? null;
  }

  obtenerImportacion(id) {
    return this.#importaciones.find((i) => i.id === id) ?? null;
  }

  registrar({ resumen, partidos }) {
    const importacion = { id: this.#siguienteImportacion, ...resumen, revertida: false };
    this.#siguienteImportacion += 1;
    for (const partido of partidos) {
      this.#partidos.push({ id: this.#siguientePartido, ...partido, importacionId: importacion.id });
      this.#siguientePartido += 1;
      this.#claves.add(claveDePartido(partido));
    }
    this.#importaciones.push(importacion);
    return importacion;
  }

  revertir(id) {
    const importacion = this.obtenerImportacion(id);
    const quitados = this.#partidos.filter((p) => p.importacionId === id);
    this.#partidos = this.#partidos.filter((p) => p.importacionId !== id);
    for (const partido of quitados) this.#claves.delete(claveDePartido(partido));
    importacion.revertida = true;
    return quitados.length;
  }
}
