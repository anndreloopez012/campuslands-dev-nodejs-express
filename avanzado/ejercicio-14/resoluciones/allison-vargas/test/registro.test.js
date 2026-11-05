import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearRegistro } from '../src/metricas/registro.js';
import {
  aPrometheus, fusionarHistograma, percentil,
} from '../src/metricas/formato.js';

describe('registro de metricas', () => {
  it('un contador suma por combinacion de etiquetas y nunca baja', () => {
    const registro = crearRegistro();
    const c = registro.contador({ nombre: 'visitas_total', ayuda: 'Visitas', etiquetas: ['sala'] });
    c.inc({ sala: 'norte' });
    c.inc({ sala: 'norte' }, 2);
    c.inc({ sala: 'sur' });
    assert.equal(c.valor({ sala: 'norte' }), 3);
    assert.equal(c.valor({ sala: 'sur' }), 1);
    assert.throws(() => c.inc({ sala: 'sur' }, -1), RangeError);
    assert.throws(() => c.inc({ sala: 'sur' }, Number.NaN), RangeError);
  });

  it('exige exactamente las etiquetas declaradas', () => {
    const registro = crearRegistro();
    const c = registro.contador({ nombre: 'a_total', ayuda: 'A', etiquetas: ['x', 'y'] });
    assert.throws(() => c.inc({ x: '1' }), /faltan \[y\]/);
    assert.throws(() => c.inc({ x: '1', y: '2', z: '3' }), /sobran \[z\]/);
  });

  it('valida nombres, ayuda, etiquetas y duplicados', () => {
    const registro = crearRegistro();
    assert.throws(() => registro.contador({ nombre: 'Mal-Nombre', ayuda: 'x' }), TypeError);
    assert.throws(() => registro.contador({ nombre: 'sin_ayuda', ayuda: ' ' }), TypeError);
    assert.throws(() => registro.contador({ nombre: 'b', ayuda: 'x', etiquetas: ['le'] }), TypeError);
    assert.throws(() => registro.contador({ nombre: 'c', ayuda: 'x', etiquetas: ['__interna'] }), TypeError);
    assert.throws(() => registro.contador({ nombre: 'd', ayuda: 'x', etiquetas: ['a', 'a'] }), TypeError);
    registro.medidor({ nombre: 'unico', ayuda: 'x' });
    assert.throws(() => registro.contador({ nombre: 'unico', ayuda: 'x' }), /ya existe/);
    assert.throws(() => registro.histograma({ nombre: 'h', ayuda: 'x', buckets: [1, 1] }), TypeError);
    assert.throws(() => registro.histograma({ nombre: 'h2', ayuda: 'x', buckets: [] }), TypeError);
  });

  it('un medidor sube, baja y se fija', () => {
    const registro = crearRegistro();
    const g = registro.medidor({ nombre: 'en_sala', ayuda: 'Personas' });
    g.inc();
    g.inc({}, 4);
    g.dec({}, 2);
    assert.equal(g.valor(), 3);
    g.set({}, 10);
    assert.equal(g.valor(), 10);
  });

  it('un histograma acumula buckets, suma y total', () => {
    const registro = crearRegistro();
    const h = registro.histograma({ nombre: 'paginas', ayuda: 'Paginas leidas', buckets: [10, 100, 500] });
    for (const v of [5, 50, 60, 700]) h.observar({}, v);
    assert.throws(() => h.observar({}, Infinity), RangeError);
    const [metrica] = registro.instantanea();
    assert.deepEqual(metrica.series[0], {
      etiquetas: {},
      buckets: [{ le: 10, conteo: 1 }, { le: 100, conteo: 3 }, { le: 500, conteo: 3 }],
      suma: 815,
      total: 4,
    });
  });

  it('limita la cantidad de series para evitar explosion de cardinalidad', () => {
    const registro = crearRegistro({ maxSeries: 2 });
    const c = registro.contador({ nombre: 'por_usuario_total', ayuda: 'x', etiquetas: ['usuario'] });
    c.inc({ usuario: 'a' });
    c.inc({ usuario: 'b' });
    c.inc({ usuario: 'c' });
    c.inc({ usuario: 'a' });
    assert.equal(registro.instantanea()[0].series.length, 2);
    assert.equal(registro.seriesDescartadas, 1);
    assert.equal(c.valor({ usuario: 'a' }), 2);
    registro.reiniciar();
    assert.equal(registro.seriesDescartadas, 0);
    assert.equal(registro.instantanea()[0].series.length, 0);
  });

  it('las metricas con recolectar se calculan en el momento de leerlas', () => {
    const registro = crearRegistro();
    let stock = 5;
    registro.medidor({
      nombre: 'stock', ayuda: 'Stock', etiquetas: ['tipo'], recolectar: () => [{ etiquetas: { tipo: 'papel' }, valor: stock }],
    });
    assert.equal(registro.instantanea()[0].series[0].valor, 5);
    stock = 2;
    assert.equal(registro.instantanea()[0].series[0].valor, 2);
  });
});

describe('formato prometheus', () => {
  it('genera HELP, TYPE, series, buckets acumulados, +Inf, _sum y _count', () => {
    const registro = crearRegistro();
    registro.contador({ nombre: 'prestamos_total', ayuda: 'Prestamos', etiquetas: ['genero'] }).inc({ genero: 'novela' }, 3);
    registro.histograma({ nombre: 'dias', ayuda: 'Dias', buckets: [7, 14] }).observar({}, 9);
    assert.equal(aPrometheus(registro.instantanea()), [
      '# HELP prestamos_total Prestamos',
      '# TYPE prestamos_total counter',
      'prestamos_total{genero="novela"} 3',
      '# HELP dias Dias',
      '# TYPE dias histogram',
      'dias_bucket{le="7"} 0',
      'dias_bucket{le="14"} 1',
      'dias_bucket{le="+Inf"} 1',
      'dias_sum 9',
      'dias_count 1',
      '',
    ].join('\n'));
  });

  it('escapa comillas, barras y saltos de linea', () => {
    const registro = crearRegistro();
    registro.contador({ nombre: 'raro_total', ayuda: 'linea\nnueva \\ barra', etiquetas: ['t'] }).inc({ t: 'di "hola"\\\n' });
    const texto = aPrometheus(registro.instantanea());
    assert.match(texto, /# HELP raro_total linea\\nnueva \\\\ barra/);
    assert.ok(texto.includes('raro_total{t="di \\"hola\\"\\\\\\n"} 1'));
  });

  it('estima percentiles interpolando dentro de los buckets', () => {
    const serie = { buckets: [{ le: 10, conteo: 50 }, { le: 20, conteo: 100 }], total: 100 };
    assert.equal(percentil(serie, 0.5), 10);
    assert.equal(percentil(serie, 0.75), 15);
    assert.equal(percentil(serie, 1), 20);
    assert.equal(percentil({ ...serie, total: 0 }, 0.5), null);
    assert.equal(percentil({ buckets: [{ le: 1, conteo: 1 }], total: 3 }, 0.99), 1);
    const fusion = fusionarHistograma([
      { buckets: [{ le: 1, conteo: 1 }], suma: 0.5, total: 1 },
      { buckets: [{ le: 1, conteo: 2 }], suma: 1, total: 2 },
    ]);
    assert.deepEqual(fusion, { buckets: [{ le: 1, conteo: 3 }], suma: 1.5, total: 3 });
    assert.equal(fusionarHistograma([]), null);
  });
});
