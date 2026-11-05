import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as service from '../src/services/procedimientos.service.js';
import { procedimientosRepository } from '../src/repositories/procedimientos.repository.js';
import { AppError } from '../src/utils/errors.js';

const datosBase = {
  proceso: 'mig',
  material: 'acero_carbono',
  voltaje: 24,
  amperaje: 200,
  velocidadMmMin: 300,
  espesorMm: 10,
  soldador: 'Ana Ruiz',
};

describe('procedimientos.service.crear', () => {
  it('guarda el procedimiento con el calor calculado y estado borrador', (t) => {
    const crear = t.mock.method(procedimientosRepository, 'crear', (datos) => ({ id: 50, ...datos }));

    const creado = service.crear(datosBase);

    assert.equal(crear.mock.callCount(), 1);
    const guardado = crear.mock.calls[0].arguments[0];
    assert.equal(guardado.calorKjMm, 0.768);
    assert.equal(guardado.clasificacion, 'bajo');
    assert.equal(guardado.estado, 'borrador');
    assert.equal(guardado.soldador, 'Ana Ruiz');
    assert.match(guardado.creadoEn, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(creado.id, 50);
  });

  it('no guarda nada si el voltaje no corresponde al proceso', (t) => {
    const crear = t.mock.method(procedimientosRepository, 'crear');

    assert.throws(
      () => service.crear({ ...datosBase, proceso: 'tig', voltaje: 35, amperaje: 100 }),
      (error) => error instanceof AppError && error.statusCode === 422 && error.codigo === 'RANGO_DE_PROCESO',
    );
    assert.equal(crear.mock.callCount(), 0);
  });

  it('no guarda nada si el calor supera el limite del material', (t) => {
    const crear = t.mock.method(procedimientosRepository, 'crear');

    assert.throws(
      () => service.crear({ ...datosBase, proceso: 'arcosumergido', material: 'aluminio', voltaje: 32, amperaje: 600, velocidadMmMin: 400 }),
      (error) => error.statusCode === 422 && error.codigo === 'CALOR_EXCEDIDO' && /2.88/.test(error.detalles[0].mensaje),
    );
    assert.equal(crear.mock.callCount(), 0);
  });
});

describe('procedimientos.service.aprobar', () => {
  it('cambia el estado a aprobado', (t) => {
    t.mock.method(procedimientosRepository, 'buscar', () => ({ id: 7, estado: 'borrador' }));
    const actualizar = t.mock.method(procedimientosRepository, 'actualizar', (id, cambios) => ({ id, ...cambios }));

    const resultado = service.aprobar(7);

    assert.deepEqual(actualizar.mock.calls[0].arguments, [7, { estado: 'aprobado' }]);
    assert.equal(resultado.estado, 'aprobado');
  });

  it('responde 409 si ya estaba aprobado', (t) => {
    t.mock.method(procedimientosRepository, 'buscar', () => ({ id: 7, estado: 'aprobado' }));
    const actualizar = t.mock.method(procedimientosRepository, 'actualizar');

    assert.throws(() => service.aprobar(7), { statusCode: 409, codigo: 'PROCEDIMIENTO_YA_APROBADO' });
    assert.equal(actualizar.mock.callCount(), 0);
  });

  it('responde 404 si no existe', (t) => {
    t.mock.method(procedimientosRepository, 'buscar', () => null);

    assert.throws(() => service.aprobar(99), { statusCode: 404, codigo: 'PROCEDIMIENTO_NO_ENCONTRADO' });
  });
});

describe('procedimientos.service.listar', () => {
  it('filtra por estado y pagina el resultado', () => {
    const { data, paginacion } = service.listar({ estado: 'aprobado', limite: '1' });

    assert.equal(data.length, 1);
    assert.ok(data.every((item) => item.estado === 'aprobado'));
    assert.equal(paginacion.limite, 1);
  });

  it('rechaza parametros desconocidos', () => {
    assert.throws(() => service.listar({ color: 'rojo' }), { statusCode: 400, codigo: 'CONSULTA_INVALIDA' });
  });
});
