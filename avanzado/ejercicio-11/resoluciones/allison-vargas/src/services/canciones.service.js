import { crear } from '../errores/index.js';
import { normalizarClave } from '../domain/texto.js';
import { paginar } from '../utils/paginacion.js';

const promedio = (suma, n) => (n ? Math.round((suma / n) * 100) / 100 : 0);

export function crearServicioCanciones({ catalogo }) {
  return {
    listar({ pagina, limite, filtros }) {
      const artista = filtros.artista ? normalizarClave(filtros.artista) : null;
      const texto = filtros.q ? normalizarClave(filtros.q) : null;
      const lista = catalogo.todas()
        .filter((c) => (!artista || normalizarClave(c.artista) === artista)
          && (!filtros.genero || c.genero === filtros.genero)
          && (filtros.anio === undefined || c.anio === filtros.anio)
          && (!texto || normalizarClave(c.titulo).includes(texto)))
        .sort((a, b) => a.titulo.localeCompare(b.titulo) || a.isrc.localeCompare(b.isrc));
      return paginar(lista, pagina, limite);
    },

    obtener(isrc) {
      const cancion = catalogo.obtener(isrc);
      if (!cancion) throw crear('CANCION_NO_ENCONTRADA', { isrc });
      return cancion;
    },

    artistas({ pagina, limite }) {
      const lista = catalogo.artistas().sort((a, b) => b.canciones - a.canciones || a.nombre.localeCompare(b.nombre));
      return paginar(lista, pagina, limite);
    },

    resumen() {
      const todas = catalogo.todas();
      const porGenero = {};
      let duracion = 0;
      for (const c of todas) {
        porGenero[c.genero] = (porGenero[c.genero] ?? 0) + 1;
        duracion += c.duracionSeg;
      }
      return {
        canciones: todas.length,
        artistas: catalogo.artistas().length,
        porGenero,
        duracionTotalSeg: duracion,
        duracionPromedioSeg: promedio(duracion, todas.length),
      };
    },
  };
}
