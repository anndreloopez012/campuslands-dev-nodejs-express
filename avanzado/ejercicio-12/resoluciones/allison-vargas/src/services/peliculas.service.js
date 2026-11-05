import { crear } from '../errores/index.js';
import { hash } from '../domain/http.js';
import { proyectar } from '../domain/proyeccion.js';
import { trozosJson } from '../domain/serializador.js';
import { normalizarClave } from '../domain/texto.js';
import { paginar } from '../utils/paginacion.js';
import { validarPelicula } from '../validators/pelicula.js';

function comparador({ campo, direccion }) {
  const signo = direccion === 'desc' ? -1 : 1;
  return (a, b) => {
    const x = a[campo];
    const y = b[campo];
    const orden = typeof x === 'string' ? x.localeCompare(y) : x - y;
    return orden * signo || a.id - b.id;
  };
}

function aplicarFiltros(peliculas, filtros) {
  const texto = filtros.q ? normalizarClave(filtros.q) : null;
  return peliculas.filter((p) => (!filtros.subgenero || p.subgenero === filtros.subgenero)
    && (!filtros.clasificacion || p.clasificacion === filtros.clasificacion)
    && (filtros.desde === undefined || p.anio >= filtros.desde)
    && (filtros.hasta === undefined || p.anio <= filtros.hasta)
    && (filtros.calificacionMin === undefined || p.calificacion >= filtros.calificacionMin)
    && (filtros.directorId === undefined || p.directorId === filtros.directorId)
    && (filtros.actorId === undefined || p.repartoIds.includes(filtros.actorId))
    && (!texto || normalizarClave(p.titulo).includes(texto) || normalizarClave(p.sinopsis).includes(texto)));
}

const sinVacios = (objeto) => Object.fromEntries(Object.entries(objeto).filter(([, valor]) => valor !== undefined));

export function crearServicioPeliculas({ catalogo, reloj, alSerializar = () => {} }) {
  const consultar = (filtros, orden) => aplicarFiltros(catalogo.peliculas, filtros).sort(comparador(orden));

  return {
    listar({ pagina, limite, orden, filtros }) {
      return paginar(consultar(filtros, orden), pagina, limite);
    },

    obtener(id) {
      const pelicula = catalogo.pelicula(id);
      if (!pelicula) throw crear('PELICULA_NO_ENCONTRADA', { peliculaId: id });
      return pelicula;
    },

    crear(cuerpo) {
      const datos = validarPelicula(cuerpo, { anioMaximo: reloj().getUTCFullYear(), catalogo });
      return catalogo.agregar(datos);
    },

    eliminar: (id) => catalogo.eliminar(id),

    abrirExportacion(parametros) {
      const {
        forma, pretty, campos, incluir, orden, limite, filtros,
      } = parametros;
      const encontradas = consultar(filtros, orden);
      const seleccion = limite === undefined ? encontradas : encontradas.slice(0, limite);
      const version = catalogo.version;
      const actualizadoEn = catalogo.actualizadoEn;
      const meta = {
        coleccion: 'peliculas',
        total: seleccion.length,
        version,
        actualizadoEn: actualizadoEn.toISOString(),
        orden: `${orden.campo}:${orden.direccion}`,
        campos,
        incluir,
        filtros: sinVacios(filtros),
      };
      function* filas() {
        for (const pelicula of seleccion) {
          yield () => {
            alSerializar(pelicula);
            return proyectar(pelicula, campos, incluir, catalogo);
          };
        }
      }
      const clave = JSON.stringify({
        forma, pretty, campos, incluir, orden, limite, filtros: meta.filtros,
      });
      return {
        total: seleccion.length,
        version,
        modificadoEn: actualizadoEn,
        etag: `W/"v${version}-${hash(clave)}"`,
        contentType: forma === 'ndjson' ? 'application/x-ndjson; charset=utf-8' : 'application/json; charset=utf-8',
        nombreArchivo: `peliculas-miedo-${actualizadoEn.toISOString().slice(0, 10).replaceAll('-', '')}.${forma === 'ndjson' ? 'ndjson' : 'json'}`,
        trozos: () => trozosJson({
          forma, pretty, meta, filas: filas(),
        }),
        meta,
      };
    },
  };
}
