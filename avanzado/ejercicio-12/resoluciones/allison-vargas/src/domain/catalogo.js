import { crear } from '../errores/index.js';
import { normalizarClave } from './texto.js';

export class Catalogo {
  #peliculas;
  #directores;
  #actores;
  #reloj;
  #siguienteId;
  version = 1;
  actualizadoEn;

  constructor({ peliculas, directores, actores, reloj }) {
    this.#peliculas = peliculas.map((p) => ({ ...p }));
    this.#directores = directores;
    this.#actores = actores;
    this.#reloj = reloj;
    this.#siguienteId = peliculas.reduce((mayor, p) => Math.max(mayor, p.id), 0) + 1;
    this.actualizadoEn = reloj();
  }

  get peliculas() {
    return this.#peliculas;
  }

  get directores() {
    return this.#directores;
  }

  get actores() {
    return this.#actores;
  }

  director(id) {
    return this.#directores.find((d) => d.id === id) ?? null;
  }

  actor(id) {
    return this.#actores.find((a) => a.id === id) ?? null;
  }

  pelicula(id) {
    return this.#peliculas.find((p) => p.id === id) ?? null;
  }

  #tocar() {
    this.version += 1;
    this.actualizadoEn = this.#reloj();
  }

  agregar(datos) {
    const clave = normalizarClave(datos.titulo);
    if (this.#peliculas.some((p) => p.anio === datos.anio && normalizarClave(p.titulo) === clave)) {
      throw crear('PELICULA_DUPLICADA', { titulo: datos.titulo, anio: datos.anio });
    }
    const pelicula = { id: this.#siguienteId, ...datos };
    this.#siguienteId += 1;
    this.#peliculas.push(pelicula);
    this.#tocar();
    return pelicula;
  }

  eliminar(id) {
    const posicion = this.#peliculas.findIndex((p) => p.id === id);
    if (posicion < 0) throw crear('PELICULA_NO_ENCONTRADA', { peliculaId: id });
    const [quitada] = this.#peliculas.splice(posicion, 1);
    this.#tocar();
    return quitada;
  }
}
