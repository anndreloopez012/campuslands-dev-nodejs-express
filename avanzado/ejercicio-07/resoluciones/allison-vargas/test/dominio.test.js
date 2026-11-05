import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import autos from '../src/data/autos.json' with { type: 'json' };
import { cotizar, resumirMarca, tasaDeLujo } from '../src/domain/cotizacion.js';
import { Inventario } from '../src/domain/inventario.js';
import { AUTO_NUEVO, rechazaCon } from '../soporte/entorno.js';

describe('cotizacion', () => {
  const roma = autos[0];

  it('la tasa de lujo sube por tramos de precio', () => {
    assert.deepEqual([150000, 200000, 200001, 500000, 500001].map(tasaDeLujo), [0.1, 0.1, 0.15, 0.15, 0.2]);
  });

  it('calcula impuesto, seguro, anticipo y cuota en dolares', () => {
    const c = cotizar(roma, { moneda: 'USD', anticipoPorcentaje: 20, meses: 36 });
    assert.equal(c.precio, 247000);
    assert.equal(c.impuestoDeLujo, 37050);
    assert.equal(c.seguro, 4940);
    assert.equal(c.total, 288990);
    assert.equal(c.anticipo, 57798);
    assert.equal(c.financiado, 231192);
    assert.equal(c.cuota, 6422);
    assert.equal(c.descripcion, 'Ferrari Roma 2024');
  });

  it('convierte a otras monedas y admite anticipo del 0 por ciento', () => {
    const c = cotizar(roma, { moneda: 'EUR', anticipoPorcentaje: 0, meses: 12 });
    assert.equal(c.precio, 227240);
    assert.equal(c.anticipo, 0);
    assert.equal(c.financiado, c.total);
  });

  it('resume una marca', () => {
    const ferrari = autos.filter((a) => a.marca === 'Ferrari');
    assert.deepEqual(resumirMarca('Ferrari', ferrari), {
      marca: 'Ferrari',
      modelos: 2,
      disponibles: 2,
      precioMinimoUsd: 247000,
      precioMaximoUsd: 524000,
      precioPromedioUsd: 385500,
      potenciaMaximaHp: 986,
    });
  });
});

describe('inventario', () => {
  it('los datos iniciales son coherentes', () => {
    assert.equal(autos.length, 16);
    assert.equal(new Set(autos.map((a) => a.vin)).size, 16);
    assert.ok(autos.every((a) => a.vin.length === 17));
  });

  it('lee, lista con filtros y ordena', async () => {
    const inventario = new Inventario({ autos });
    assert.equal((await inventario.leer(3)).modelo, 'Huracan Tecnica');
    assert.equal(await inventario.leer(99), null);
    const suv = await inventario.listar({ categoria: 'suv', orden: '-precio' });
    assert.deepEqual(suv.map((a) => a.id), [10, 4, 8]);
    const baratos = await inventario.listar({ minimo: 200000, maximo: 240000, disponible: true, orden: 'precio' });
    assert.deepEqual(baratos.map((a) => a.id), [5, 15, 12, 3]);
    assert.equal((await inventario.listar({ marca: 'PORSCHE' })).length, 2);
    assert.deepEqual((await inventario.listar({ orden: '-potencia' })).slice(0, 2).map((a) => a.id), [16, 14]);
  });

  it('entrega copias que no alteran el inventario', async () => {
    const inventario = new Inventario({ autos });
    const auto = await inventario.leer(1);
    auto.precioUsd = 1;
    assert.equal((await inventario.leer(1)).precioUsd, 247000);
  });

  it('crea con id siguiente, actualiza y elimina', async () => {
    const inventario = new Inventario({ autos });
    const nuevo = await inventario.crear(AUTO_NUEVO);
    assert.equal(nuevo.id, 17);
    assert.equal(nuevo.disponible, true);
    const { anterior, actual } = await inventario.actualizar(17, { precioUsd: 330000 });
    assert.equal(anterior.precioUsd, 322000);
    assert.equal(actual.precioUsd, 330000);
    assert.equal((await inventario.eliminar(17)).id, 17);
    assert.equal(await inventario.leer(17), null);
  });

  it('rechaza VIN repetido y ids inexistentes', async () => {
    const inventario = new Inventario({ autos });
    await assert.rejects(inventario.crear({ ...AUTO_NUEVO, vin: autos[0].vin }), rechazaCon('VIN_DUPLICADO'));
    await assert.rejects(inventario.actualizar(2, { vin: autos[0].vin }), rechazaCon('VIN_DUPLICADO'));
    await inventario.actualizar(2, { vin: autos[1].vin });
    await assert.rejects(inventario.actualizar(77, {}), rechazaCon('AUTO_NO_ENCONTRADO', { autoId: 77 }));
    await assert.rejects(inventario.eliminar(77), rechazaCon('AUTO_NO_ENCONTRADO'));
  });

  it('cuenta las lecturas a la fuente', async () => {
    const inventario = new Inventario({ autos });
    await inventario.leer(1);
    await inventario.listar({});
    await inventario.autosDeMarca('Ferrari');
    assert.deepEqual(inventario.lecturas(), { auto: 1, lista: 1, marca: 1, total: 3 });
  });
});
