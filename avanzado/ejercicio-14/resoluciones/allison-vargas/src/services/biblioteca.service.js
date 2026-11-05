import { crear } from '../errores/index.js';
import { validarPrestamo } from '../validators/prestamo.js';

const DIA_MS = 24 * 60 * 60 * 1000;
export const DIAS_PRESTAMO = 14;
export const MAX_ACTIVOS_POR_LECTOR = 3;
export const MULTA_POR_DIA = 500;

export function crearMetricasBiblioteca(registro, { libros, prestamos }) {
  const generos = () => [...new Set(libros.map((l) => l.genero))];
  return {
    prestamos: registro.contador({
      nombre: 'biblioteca_prestamos_total', ayuda: 'Prestamos realizados por genero', etiquetas: ['genero'],
    }),
    rechazos: registro.contador({
      nombre: 'biblioteca_prestamos_rechazados_total', ayuda: 'Prestamos rechazados por motivo', etiquetas: ['motivo'],
    }),
    devoluciones: registro.contador({
      nombre: 'biblioteca_devoluciones_total', ayuda: 'Devoluciones segun si llegaron a tiempo', etiquetas: ['puntual'],
    }),
    dias: registro.histograma({
      nombre: 'biblioteca_dias_prestamo', ayuda: 'Dias que duro cada prestamo devuelto', buckets: [1, 3, 7, 14, 21, 30, 60],
    }),
    disponibles: registro.medidor({
      nombre: 'biblioteca_ejemplares_disponibles',
      ayuda: 'Ejemplares disponibles por genero (se calcula al consultar)',
      etiquetas: ['genero'],
      recolectar: () => generos().map((genero) => ({
        etiquetas: { genero },
        valor: libros.filter((l) => l.genero === genero).reduce((t, l) => t + l.disponibles, 0),
      })),
    }),
    activos: registro.medidor({
      nombre: 'biblioteca_prestamos_activos',
      ayuda: 'Prestamos sin devolver (se calcula al consultar)',
      recolectar: () => [{ valor: [...prestamos.values()].filter((p) => !p.devueltoEn).length }],
    }),
  };
}

export function crearServicioBiblioteca({ libros: base, reloj, registro }) {
  const libros = base.map((l) => ({ ...l, disponibles: l.ejemplares }));
  const prestamos = new Map();
  const metricas = crearMetricasBiblioteca(registro, { libros, prestamos });
  let siguienteId = 1;

  function libro(id) {
    const encontrado = libros.find((l) => l.id === id);
    if (!encontrado) throw crear('LIBRO_NO_ENCONTRADO', { libroId: id });
    return encontrado;
  }

  function prestamo(id) {
    const encontrado = prestamos.get(id);
    if (!encontrado) throw crear('PRESTAMO_NO_ENCONTRADO', { prestamoId: id });
    return encontrado;
  }

  function rechazar(motivo, error) {
    metricas.rechazos.inc({ motivo });
    return error;
  }

  return {
    listarLibros: ({ genero } = {}) => libros.filter((l) => !genero || l.genero === genero).map((l) => ({ ...l })),
    obtenerLibro: (id) => ({ ...libro(id) }),
    generos: () => [...new Set(libros.map((l) => l.genero))],

    listarPrestamos: ({ activos } = {}) => [...prestamos.values()]
      .filter((p) => activos === undefined || activos === !p.devueltoEn)
      .map((p) => ({ ...p })),

    prestar(cuerpo) {
      const { libroId, lector } = validarPrestamo(cuerpo);
      const elegido = libro(libroId);
      const activosDelLector = [...prestamos.values()].filter((p) => p.lector === lector && !p.devueltoEn).length;
      if (activosDelLector >= MAX_ACTIVOS_POR_LECTOR) {
        throw rechazar('limite_lector', crear('LIMITE_DE_PRESTAMOS', { lector, maximo: MAX_ACTIVOS_POR_LECTOR }));
      }
      if (elegido.disponibles === 0) throw rechazar('sin_ejemplares', crear('SIN_EJEMPLARES', { titulo: elegido.titulo }));
      const ahora = reloj();
      const nuevo = {
        id: siguienteId,
        libroId,
        lector,
        prestadoEn: ahora.toISOString(),
        venceEn: new Date(ahora.getTime() + DIAS_PRESTAMO * DIA_MS).toISOString(),
        devueltoEn: null,
        dias: null,
        diasAtraso: null,
        multa: null,
      };
      siguienteId += 1;
      elegido.disponibles -= 1;
      prestamos.set(nuevo.id, nuevo);
      metricas.prestamos.inc({ genero: elegido.genero });
      return { ...nuevo };
    },

    devolver(id) {
      const actual = prestamo(id);
      if (actual.devueltoEn) throw crear('PRESTAMO_YA_DEVUELTO', { prestamoId: id });
      const ahora = reloj();
      const transcurrido = ahora.getTime() - Date.parse(actual.prestadoEn);
      const atraso = ahora.getTime() - Date.parse(actual.venceEn);
      actual.devueltoEn = ahora.toISOString();
      actual.dias = Math.max(1, Math.ceil(transcurrido / DIA_MS));
      actual.diasAtraso = atraso > 0 ? Math.ceil(atraso / DIA_MS) : 0;
      actual.multa = actual.diasAtraso * MULTA_POR_DIA;
      libro(actual.libroId).disponibles += 1;
      metricas.devoluciones.inc({ puntual: actual.diasAtraso === 0 ? 'si' : 'no' });
      metricas.dias.observar({}, actual.dias);
      return { ...actual };
    },
  };
}
