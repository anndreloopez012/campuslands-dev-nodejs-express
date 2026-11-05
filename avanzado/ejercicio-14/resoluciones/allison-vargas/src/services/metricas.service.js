import { aPrometheus, fusionarHistograma, percentil } from '../metricas/formato.js';

const redondear = (valor, decimales = 2) => (valor === null ? null : Number(valor.toFixed(decimales)));

export function crearServicioMetricas({ registro, reloj }) {
  const inicio = reloj();
  const buscar = (instantanea, nombre) => instantanea.find((m) => m.nombre === nombre);

  return {
    texto: () => aPrometheus(registro.instantanea()),

    json: () => ({
      generadoEn: reloj().toISOString(),
      seriesDescartadas: registro.seriesDescartadas,
      metricas: registro.instantanea(),
    }),

    resumen() {
      const foto = registro.instantanea();
      const peticiones = buscar(foto, 'http_peticiones_total').series;
      const total = peticiones.reduce((t, s) => t + s.valor, 0);
      const contar = (prueba) => peticiones.filter((s) => prueba(Number(s.etiquetas.status)))
        .reduce((t, s) => t + s.valor, 0);
      const errores5xx = contar((st) => st >= 500);
      const errores4xx = contar((st) => st >= 400 && st < 500);
      const porRuta = new Map();
      for (const s of peticiones) {
        const clave = `${s.etiquetas.metodo} ${s.etiquetas.ruta}`;
        porRuta.set(clave, (porRuta.get(clave) ?? 0) + s.valor);
      }
      const latencia = fusionarHistograma(buscar(foto, 'http_duracion_segundos').series);
      const enMs = (p) => redondear(latencia && percentil(latencia, p) * 1000);
      const valorDe = (nombre) => buscar(foto, nombre).series.reduce((t, s) => t + s.valor, 0);
      return {
        tiempoActivoS: Math.round((reloj().getTime() - inicio.getTime()) / 1000),
        http: {
          total,
          errores4xx,
          errores5xx,
          tasaError: total ? redondear(errores5xx / total, 4) : 0,
          latenciaMs: {
            p50: enMs(0.5), p95: enMs(0.95), p99: enMs(0.99), promedio: redondear(latencia && latencia.total ? (latencia.suma / latencia.total) * 1000 : null),
          },
          masUsadas: [...porRuta.entries()]
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .slice(0, 5)
            .map(([ruta, peticionesRuta]) => ({ ruta, peticiones: peticionesRuta })),
        },
        biblioteca: {
          prestamos: valorDe('biblioteca_prestamos_total'),
          rechazos: valorDe('biblioteca_prestamos_rechazados_total'),
          activos: valorDe('biblioteca_prestamos_activos'),
          disponibles: valorDe('biblioteca_ejemplares_disponibles'),
        },
      };
    },
  };
}
