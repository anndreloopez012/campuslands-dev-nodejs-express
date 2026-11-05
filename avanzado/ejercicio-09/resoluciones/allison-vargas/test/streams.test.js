import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import {
  ACsv, ANdjson, AcumuladorDeImportacion, AgregadorDeEstadisticas, DeLineas, LimitadorDeBytes, ValidadorDeLineas, escaparCsv,
} from '../src/domain/streams.js';
import { rechazaCon } from '../soporte/entorno.js';

async function leerLineas(trozos, maxima = 100) {
  const salida = [];
  await pipeline(
    Readable.from(trozos.map((t) => Buffer.from(t)), { objectMode: false }),
    new DeLineas({ maxima }),
    new Writable({ objectMode: true, write(item, enc, hecho) { salida.push(item); hecho(); } }),
  );
  return salida;
}

describe('DeLineas', () => {
  it('junta lineas partidas entre trozos', async () => {
    const r = await leerLineas(['{"a"', ':1}\n{"b":', '2}\n']);
    assert.deepEqual(r, [{ numero: 1, texto: '{"a":1}' }, { numero: 2, texto: '{"b":2}' }]);
  });

  it('entrega la ultima linea aunque no termine en salto', async () => {
    const r = await leerLineas(['uno\ndos']);
    assert.deepEqual(r.map((l) => l.texto), ['uno', 'dos']);
  });

  it('quita el retorno de carro y salta lineas vacias sin perder la numeracion', async () => {
    const r = await leerLineas(['uno\r\n\r\n   \ntres\r\n']);
    assert.deepEqual(r, [{ numero: 1, texto: 'uno' }, { numero: 4, texto: 'tres' }]);
  });

  it('no rompe caracteres de varios bytes partidos entre trozos', async () => {
    const texto = '\u00f1and\u00fa \u{1F94A}';
    const bytes = Buffer.from(`${texto}\n`);
    const trozos = [];
    for (let i = 0; i < bytes.length; i += 1) trozos.push(bytes.subarray(i, i + 1));
    const salida = [];
    await pipeline(
      Readable.from(trozos),
      new DeLineas({ maxima: 50 }),
      new Writable({ objectMode: true, write(item, enc, hecho) { salida.push(item.texto); hecho(); } }),
    );
    assert.deepEqual(salida, [texto]);
  });

  it('rechaza una linea demasiado larga aunque nunca llegue el salto', async () => {
    await assert.rejects(leerLineas(['x'.repeat(30), 'y'.repeat(30)], 40), rechazaCon('LINEA_DEMASIADO_LARGA', { linea: 1, maximo: 40 }));
  });

  it('rechaza una linea larga ya terminada', async () => {
    await assert.rejects(leerLineas([`ok\n${'z'.repeat(50)}\n`], 40), rechazaCon('LINEA_DEMASIADO_LARGA', { linea: 2 }));
  });
});

describe('LimitadorDeBytes', () => {
  it('deja pasar hasta el maximo y cuenta los bytes', async () => {
    const limitador = new LimitadorDeBytes(10);
    const partes = [];
    await pipeline(
      Readable.from([Buffer.from('12345'), Buffer.from('67890')]),
      limitador,
      new Writable({ write(p, enc, hecho) { partes.push(p); hecho(); } }),
    );
    assert.equal(limitador.bytes, 10);
    assert.equal(Buffer.concat(partes).toString(), '1234567890');
  });

  it('falla al pasarse del maximo', async () => {
    await assert.rejects(
      pipeline(Readable.from([Buffer.alloc(8), Buffer.alloc(8)]), new LimitadorDeBytes(10), new Writable({ write(p, enc, hecho) { hecho(); } })),
      rechazaCon('PAYLOAD_GRANDE'),
    );
  });
});

describe('ANdjson y ACsv', () => {
  const recolectar = async (transformador, objetos) => {
    let texto = '';
    await pipeline(
      Readable.from(objetos, { objectMode: true }),
      transformador,
      new Writable({ write(p, enc, hecho) { texto += p.toString(); hecho(); } }),
    );
    return texto;
  };

  it('ANdjson escribe un objeto por linea', async () => {
    assert.equal(await recolectar(new ANdjson(), [{ a: 1 }, { b: 'x' }]), '{"a":1}\n{"b":"x"}\n');
  });

  it('ACsv escribe el encabezado una sola vez', async () => {
    const texto = await recolectar(new ACsv(['a', 'b']), [{ a: 1, b: null }, { a: 2, b: 'x' }]);
    assert.equal(texto, 'a,b\n1,\n2,x\n');
  });

  it('ACsv escribe el encabezado aunque no haya filas', async () => {
    assert.equal(await recolectar(new ACsv(['a', 'b']), []), 'a,b\n');
  });

  it('escaparCsv protege comas, comillas y saltos', () => {
    assert.equal(escaparCsv('a,b'), '"a,b"');
    assert.equal(escaparCsv('dice "hola"'), '"dice ""hola"""');
    assert.equal(escaparCsv('uno\ndos'), '"uno\ndos"');
    assert.equal(escaparCsv(null), '');
    assert.equal(escaparCsv(0), '0');
  });
});

describe('ValidadorDeLineas y AcumuladorDeImportacion', () => {
  it('marca las lineas que no son json y las que no validan', async () => {
    const validar = (dato) => (dato.ok ? { valor: dato } : { errores: [{ campo: 'ok', mensaje: 'falta' }] });
    const acumulador = new AcumuladorDeImportacion({ maxErrores: 1 });
    await pipeline(
      Readable.from([{ numero: 1, texto: '{"ok":true}' }, { numero: 2, texto: 'nada' }, { numero: 3, texto: '{}' }], { objectMode: true }),
      new ValidadorDeLineas(validar),
      acumulador,
    );
    assert.equal(acumulador.recibidas, 3);
    assert.equal(acumulador.validas.length, 1);
    assert.equal(acumulador.rechazadas, 2);
    assert.equal(acumulador.errores.length, 1);
    assert.equal(acumulador.errores[0].linea, 2);
  });
});

describe('contrapresion', () => {
  it('el productor no se adelanta mas alla del buffer cuando el consumidor es lento', async () => {
    let producidos = 0;
    let consumidos = 0;
    let maxAdelanto = 0;
    async function* fuente() {
      for (let i = 0; i < 100; i += 1) {
        producidos += 1;
        maxAdelanto = Math.max(maxAdelanto, producidos - consumidos);
        yield i;
      }
    }
    await pipeline(
      Readable.from(fuente(), { objectMode: true, highWaterMark: 4 }),
      new Writable({
        objectMode: true,
        highWaterMark: 2,
        write(item, enc, hecho) {
          consumidos += 1;
          setImmediate(hecho);
        },
      }),
    );
    assert.equal(consumidos, 100);
    assert.ok(maxAdelanto <= 10, `adelanto ${maxAdelanto}`);
  });
});

describe('AgregadorDeEstadisticas', () => {
  it('resume sin guardar los combates y maneja el caso vacio', async () => {
    const vacio = new AgregadorDeEstadisticas();
    assert.equal(vacio.resumen(new Map()).promedioRounds, 0);
    const lista = [
      { metodo: 'ko', categoria: 'ligero', rounds: 2, golpesRojo: 10, golpesAzul: 10, ganadorId: 1, fecha: '2020-01-02' },
      { metodo: 'decision', categoria: 'ligero', rounds: 4, golpesRojo: 30, golpesAzul: 10, ganadorId: 1, fecha: '2020-01-01' },
      { metodo: 'empate', categoria: 'medio', rounds: 3, golpesRojo: 5, golpesAzul: 5, ganadorId: null, fecha: '2020-01-05' },
    ];
    const agregador = new AgregadorDeEstadisticas();
    await pipeline(Readable.from(lista, { objectMode: true }), agregador);
    const r = agregador.resumen(new Map([[1, 'Marco']]));
    assert.equal(r.total, 3);
    assert.equal(r.promedioRounds, 3);
    assert.equal(r.porcentajeFinalizados, 33.33);
    assert.equal(r.primeraFecha, '2020-01-01');
    assert.equal(r.ultimaFecha, '2020-01-05');
    assert.deepEqual(r.masVictorias, [{ peleadorId: 1, nombre: 'Marco', victorias: 2 }]);
  });
});
