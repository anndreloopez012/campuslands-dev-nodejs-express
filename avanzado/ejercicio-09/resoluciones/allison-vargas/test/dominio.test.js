import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Fuente } from '../src/domain/fuente.js';
import { agruparPorCategoria, generarCombate } from '../src/domain/generador.js';
import { construirFiltro, filtrar, tomar } from '../src/domain/filtros.js';
import { validarCombate, esFechaReal, leerExportacion, leerListado, leerImportacion } from '../src/validators/combates.js';
import { COMBATE_BASE, peleadores, rechazaCon } from '../soporte/entorno.js';

const porId = new Map(peleadores.map((p) => [p.id, p]));
const porCategoria = agruparPorCategoria(peleadores);

async function juntar(iterable) {
  const lista = [];
  for await (const e of iterable) lista.push(e);
  return lista;
}

describe('generador', () => {
  it('es determinista: el mismo id da siempre el mismo combate', () => {
    assert.deepEqual(generarCombate(77, porCategoria), generarCombate(77, porCategoria));
    assert.notDeepEqual(generarCombate(77, porCategoria), generarCombate(78, porCategoria));
  });

  it('todos los combates generados pasan la validacion', () => {
    for (let id = 1; id <= 3000; id += 1) {
      const { id: quitado, ...resto } = generarCombate(id, porCategoria);
      const resultado = validarCombate(resto, porId);
      assert.equal(resultado.errores, undefined, `id ${id}: ${JSON.stringify(resultado.errores)}`);
    }
  });
});

describe('Fuente', () => {
  it('recorre todos los combates en orden', async () => {
    const fuente = new Fuente({ peleadores, total: 25 });
    const ids = (await juntar(fuente.recorrer())).map((c) => c.id);
    assert.deepEqual(ids, Array.from({ length: 25 }, (_, i) => i + 1));
  });

  it('obtener devuelve null fuera de rango', () => {
    const fuente = new Fuente({ peleadores, total: 5 });
    assert.equal(fuente.obtener(0), null);
    assert.equal(fuente.obtener(6), null);
    assert.equal(fuente.obtener(5).id, 5);
  });

  it('importar asigna ids consecutivos y no pisa los generados', () => {
    const fuente = new Fuente({ peleadores, total: 5 });
    const rango = fuente.importar([COMBATE_BASE, COMBATE_BASE]);
    assert.deepEqual(rango, { primero: 6, ultimo: 7 });
    assert.equal(fuente.cantidad, 7);
    assert.equal(fuente.obtener(7).id, 7);
    assert.equal(fuente.importar([]), null);
  });
});

describe('filtros', () => {
  it('construirFiltro combina criterios', () => {
    const f = construirFiltro({ peleadorId: 3, metodo: 'ko', desde: '2020-01-01', hasta: '2020-12-31' });
    assert.equal(f({ rojoId: 3, azulId: 1, metodo: 'ko', fecha: '2020-05-05', categoria: 'ligero' }), true);
    assert.equal(f({ rojoId: 1, azulId: 3, metodo: 'ko', fecha: '2020-05-05', categoria: 'ligero' }), true);
    assert.equal(f({ rojoId: 1, azulId: 2, metodo: 'ko', fecha: '2020-05-05', categoria: 'ligero' }), false);
    assert.equal(f({ rojoId: 3, azulId: 1, metodo: 'tko', fecha: '2020-05-05', categoria: 'ligero' }), false);
    assert.equal(f({ rojoId: 3, azulId: 1, metodo: 'ko', fecha: '2021-01-01', categoria: 'ligero' }), false);
  });

  it('tomar corta la iteracion sin consumir el resto', async () => {
    let produccion = 0;
    async function* numeros() {
      for (let i = 1; i <= 1000; i += 1) {
        produccion += 1;
        yield i;
      }
    }
    assert.deepEqual(await juntar(tomar(numeros(), 3)), [1, 2, 3]);
    assert.equal(produccion, 3);
    assert.deepEqual(await juntar(tomar(numeros(), 0)), []);
    assert.deepEqual(await juntar(filtrar(numeros(), (n) => n % 500 === 0)), [500, 1000]);
  });
});

describe('validarCombate', () => {
  const con = (cambios) => validarCombate({ ...COMBATE_BASE, ...cambios }, porId);
  const campos = (r) => r.errores.map((e) => e.campo);

  it('acepta un combate correcto', () => {
    assert.deepEqual(con({}).valor, COMBATE_BASE);
  });

  it('exige un objeto y rechaza campos extra', () => {
    assert.deepEqual(validarCombate([], porId).errores[0].campo, 'linea');
    assert.deepEqual(campos(con({ id: 5 })), ['id']);
  });

  it('valida la fecha real', () => {
    assert.equal(esFechaReal('2024-02-29'), true);
    assert.equal(esFechaReal('2023-02-29'), false);
    assert.equal(esFechaReal('2023-1-1'), false);
    assert.equal(esFechaReal(20230101), false);
    assert.ok(campos(con({ fecha: '2023-02-31' })).includes('fecha'));
  });

  it('valida peleadores: existentes, distintos y de la misma categoria', () => {
    assert.ok(campos(con({ rojoId: 999 })).includes('rojoId'));
    assert.ok(campos(con({ azulId: 1, ganadorId: 1 })).includes('azulId'));
    assert.ok(campos(con({ azulId: 5, ganadorId: 1 })).includes('categoria'));
    assert.ok(campos(con({ categoria: 'medio' })).includes('categoria'));
  });

  it('valida el ganador segun el metodo', () => {
    assert.ok(campos(con({ ganadorId: 9 })).includes('ganadorId'));
    assert.ok(campos(con({ ganadorId: null })).includes('ganadorId'));
    assert.ok(campos(con({ metodo: 'empate' })).includes('ganadorId'));
    assert.equal(con({ metodo: 'empate', ganadorId: null }).valor.ganadorId, null);
  });

  it('valida los rangos numericos', () => {
    assert.ok(campos(con({ rounds: 6 })).includes('rounds'));
    assert.ok(campos(con({ golpesRojo: -1 })).includes('golpesRojo'));
    assert.ok(campos(con({ golpesAzul: 1.5 })).includes('golpesAzul'));
    assert.ok(campos(con({ metodo: 'pelea' })).includes('metodo'));
  });
});

describe('lectura de consultas', () => {
  it('leerExportacion usa valores por defecto', () => {
    const r = leerExportacion({});
    assert.equal(r.formato, 'ndjson');
    assert.equal(r.limite, 50000);
  });

  it('acumula todos los errores de la consulta', () => {
    assert.throws(
      () => leerExportacion({ formato: 'xml', limite: '0', peleadorId: 'a', desde: '2020-02-30', extra: '1' }),
      (error) => rechazaCon('VALIDACION')(error) && error.detalles.length === 5,
    );
  });

  it('rechaza un rango de fechas invertido', () => {
    assert.throws(() => leerListado({ desde: '2021-01-01', hasta: '2020-01-01' }), rechazaCon('VALIDACION'));
  });

  it('leerImportacion acepta solo los modos conocidos', () => {
    assert.equal(leerImportacion({}).modo, 'permisivo');
    assert.equal(leerImportacion({ modo: 'estricto' }).modo, 'estricto');
    assert.throws(() => leerImportacion({ modo: 'loco' }), rechazaCon('VALIDACION'));
  });
});
