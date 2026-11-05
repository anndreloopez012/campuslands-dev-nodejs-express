export const TIPO_PROMETHEUS = 'text/plain; version=0.0.4; charset=utf-8';

const escaparAyuda = (texto) => texto.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
const escaparValor = (texto) => texto.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

function numero(valor) {
  if (valor === Infinity) return '+Inf';
  if (valor === -Infinity) return '-Inf';
  if (Number.isNaN(valor)) return 'NaN';
  return String(valor);
}

function etiquetas(pares) {
  const entradas = Object.entries(pares);
  if (!entradas.length) return '';
  return `{${entradas.map(([k, v]) => `${k}="${escaparValor(String(v))}"`).join(',')}}`;
}

export function aPrometheus(instantanea) {
  const lineas = [];
  for (const metrica of instantanea) {
    lineas.push(`# HELP ${metrica.nombre} ${escaparAyuda(metrica.ayuda)}`);
    lineas.push(`# TYPE ${metrica.nombre} ${metrica.tipo}`);
    for (const serie of metrica.series) {
      if (metrica.tipo !== 'histogram') {
        lineas.push(`${metrica.nombre}${etiquetas(serie.etiquetas)} ${numero(serie.valor)}`);
        continue;
      }
      for (const { le, conteo } of serie.buckets) {
        lineas.push(`${metrica.nombre}_bucket${etiquetas({ ...serie.etiquetas, le: numero(le) })} ${conteo}`);
      }
      lineas.push(`${metrica.nombre}_bucket${etiquetas({ ...serie.etiquetas, le: '+Inf' })} ${serie.total}`);
      lineas.push(`${metrica.nombre}_sum${etiquetas(serie.etiquetas)} ${numero(serie.suma)}`);
      lineas.push(`${metrica.nombre}_count${etiquetas(serie.etiquetas)} ${serie.total}`);
    }
  }
  return `${lineas.join('\n')}\n`;
}

export function percentil(serie, p) {
  if (!serie || serie.total === 0) return null;
  const objetivo = p * serie.total;
  let anteriorLe = 0;
  let anteriorConteo = 0;
  for (const { le, conteo } of serie.buckets) {
    if (conteo >= objetivo) {
      const enBucket = conteo - anteriorConteo;
      const fraccion = enBucket === 0 ? 0 : (objetivo - anteriorConteo) / enBucket;
      return anteriorLe + (le - anteriorLe) * fraccion;
    }
    anteriorLe = le;
    anteriorConteo = conteo;
  }
  return anteriorLe;
}

export function fusionarHistograma(series) {
  if (!series.length) return null;
  const buckets = series[0].buckets.map(({ le }, i) => ({
    le, conteo: series.reduce((t, s) => t + s.buckets[i].conteo, 0),
  }));
  return {
    buckets,
    suma: series.reduce((t, s) => t + s.suma, 0),
    total: series.reduce((t, s) => t + s.total, 0),
  };
}
