const PATRON_NOMBRE = /^[a-z_][a-z0-9_]*$/;
const RESERVADAS = new Set(['le']);

export const BUCKETS_DURACION = Object.freeze([0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5]);

function validarDefinicion({ nombre, ayuda, etiquetas }) {
  if (!PATRON_NOMBRE.test(nombre)) throw new TypeError(`Nombre de metrica invalido: ${nombre}`);
  if (typeof ayuda !== 'string' || !ayuda.trim()) throw new TypeError(`La metrica ${nombre} necesita ayuda`);
  for (const etiqueta of etiquetas) {
    if (!PATRON_NOMBRE.test(etiqueta) || RESERVADAS.has(etiqueta) || etiqueta.startsWith('__')) {
      throw new TypeError(`Etiqueta invalida en ${nombre}: ${etiqueta}`);
    }
  }
  if (new Set(etiquetas).size !== etiquetas.length) throw new TypeError(`Etiquetas repetidas en ${nombre}`);
}

function claveDeSerie(nombre, etiquetas, valores = {}) {
  const recibidas = Object.keys(valores);
  const faltan = etiquetas.filter((e) => !(e in valores));
  const sobran = recibidas.filter((e) => !etiquetas.includes(e));
  if (faltan.length || sobran.length) {
    throw new TypeError(`Etiquetas incorrectas en ${nombre}: faltan [${faltan}] sobran [${sobran}]`);
  }
  return JSON.stringify(etiquetas.map((e) => String(valores[e])));
}

export function crearRegistro({ maxSeries = 200 } = {}) {
  const metricas = new Map();
  let seriesDescartadas = 0;

  function registrar(tipo, definicion, crearValor) {
    const { nombre, ayuda, etiquetas = [] } = definicion;
    validarDefinicion({ nombre, ayuda, etiquetas });
    if (metricas.has(nombre)) throw new TypeError(`La metrica ${nombre} ya existe`);
    const series = new Map();
    const metrica = {
      nombre, ayuda, tipo, etiquetas, series, recolectar: definicion.recolectar, buckets: definicion.buckets,
    };
    metricas.set(nombre, metrica);

    function serie(valores) {
      const clave = claveDeSerie(nombre, etiquetas, valores);
      let actual = series.get(clave);
      if (!actual) {
        if (series.size >= maxSeries) {
          seriesDescartadas += 1;
          return null;
        }
        actual = { etiquetas: Object.fromEntries(etiquetas.map((e) => [e, String(valores[e])])), ...crearValor() };
        series.set(clave, actual);
      }
      return actual;
    }
    return { metrica, serie };
  }

  return {
    contador(definicion) {
      const { serie } = registrar('counter', definicion, () => ({ valor: 0 }));
      return {
        inc(valores = {}, cantidad = 1) {
          if (!Number.isFinite(cantidad) || cantidad < 0) throw new RangeError('Un contador solo puede aumentar');
          const s = serie(valores);
          if (s) s.valor += cantidad;
        },
        valor: (valores = {}) => serie(valores)?.valor ?? 0,
      };
    },

    medidor(definicion) {
      const { serie } = registrar('gauge', definicion, () => ({ valor: 0 }));
      const cambiar = (valores, fn) => {
        const s = serie(valores);
        if (s) s.valor = fn(s.valor);
      };
      return {
        set: (valores, valor) => cambiar(valores, () => valor),
        inc: (valores = {}, cantidad = 1) => cambiar(valores, (v) => v + cantidad),
        dec: (valores = {}, cantidad = 1) => cambiar(valores, (v) => v - cantidad),
        valor: (valores = {}) => serie(valores)?.valor ?? 0,
      };
    },

    histograma(definicion) {
      const buckets = [...(definicion.buckets ?? BUCKETS_DURACION)];
      if (!buckets.length || buckets.some((b, i) => !Number.isFinite(b) || (i > 0 && b <= buckets[i - 1]))) {
        throw new TypeError(`Buckets invalidos en ${definicion.nombre}`);
      }
      const { serie } = registrar('histogram', { ...definicion, buckets }, () => ({
        conteos: buckets.map(() => 0), suma: 0, total: 0,
      }));
      return {
        observar(valores, valor) {
          if (!Number.isFinite(valor)) throw new RangeError('Observacion invalida');
          const s = serie(valores);
          if (!s) return;
          s.suma += valor;
          s.total += 1;
          const indice = buckets.findIndex((b) => valor <= b);
          if (indice !== -1) s.conteos[indice] += 1;
        },
        buckets,
      };
    },

    instantanea() {
      const salida = [];
      for (const metrica of metricas.values()) {
        if (metrica.recolectar) {
          metrica.series.clear();
          for (const { etiquetas = {}, valor } of metrica.recolectar()) {
            const clave = claveDeSerie(metrica.nombre, metrica.etiquetas, etiquetas);
            metrica.series.set(clave, { etiquetas: { ...etiquetas }, valor });
          }
        }
        const series = [...metrica.series.values()].map((s) => {
          if (metrica.tipo !== 'histogram') return { etiquetas: { ...s.etiquetas }, valor: s.valor };
          let acumulado = 0;
          const buckets = metrica.buckets.map((le, i) => {
            acumulado += s.conteos[i];
            return { le, conteo: acumulado };
          });
          return {
            etiquetas: { ...s.etiquetas }, buckets, suma: s.suma, total: s.total,
          };
        });
        salida.push({
          nombre: metrica.nombre, tipo: metrica.tipo, ayuda: metrica.ayuda, series,
        });
      }
      return salida;
    },

    get seriesDescartadas() { return seriesDescartadas; },
    reiniciar() {
      for (const metrica of metricas.values()) metrica.series.clear();
      seriesDescartadas = 0;
    },
  };
}
