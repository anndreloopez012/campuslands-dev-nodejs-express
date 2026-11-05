import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp, crearServicios } from '../src/app.js';
import { levantar } from '../soporte/cliente.js';

const DIA = 24 * 60 * 60 * 1000;

async function conApi(prueba) {
  let actual = Date.parse('2026-11-05T12:00:00.000Z');
  const servicios = crearServicios({ reloj: () => new Date(actual), registroJobs: () => {} });
  const api = await levantar(crearApp({ servicios, registro: () => {} }));
  try {
    await prueba({
      ...api,
      avanzar: (ms) => { actual += ms; },
      planificador: servicios.planificador,
      ejecutar: async (nombre) => (await api.pedir(`/jobs/${nombre}/ejecucion`, { method: 'POST' })).cuerpo.data,
    });
  } finally {
    await api.cerrar();
  }
}

describe('jobs del taller', () => {
  it('lista los jobs con su cron y la proxima ejecucion', () => conApi(async (api) => {
    const { data } = (await api.pedir('/jobs')).cuerpo;
    assert.deepEqual(data.map((j) => [j.nombre, j.proximaEjecucion]), [
      ['revisar-mantenimiento', '2026-11-06T07:00:00.000Z'],
      ['vencimiento-certificaciones', '2026-11-09T08:00:00.000Z'],
      ['reponer-consumibles', '2026-11-05T12:30:00.000Z'],
      ['limpiar-alertas', '2026-11-06T03:00:00.000Z'],
    ]);
    assert.equal((await api.pedir('/')).cuerpo.topic, 'jobs programados');
  }));

  it('mantenimiento: alerta sin duplicar y se resuelve al mantener', () => conApi(async (api) => {
    const r = await api.ejecutar('revisar-mantenimiento');
    assert.deepEqual([r.resultado, r.detalle], ['exito', { revisadas: 4, alertasNuevas: 2 }]);
    assert.deepEqual((await api.ejecutar('revisar-mantenimiento')).detalle.alertasNuevas, 0);
    const alertas = (await api.pedir('/alertas?estado=abierta')).cuerpo.data;
    assert.deepEqual(alertas.map((a) => a.clave), ['mant-1', 'mant-3']);
    await api.pedir('/maquinas/3/mantenimiento', { method: 'POST' });
    assert.equal((await api.pedir('/alertas?estado=abierta')).cuerpo.data.length, 1);
    await api.json('/maquinas/2/uso', { horas: 24 });
    assert.equal((await api.pedir('/maquinas')).cuerpo.data[1].horasDesdeMantenimiento, 64);
  }));

  it('certificaciones: avisa las proximas a vencer y suspende las vencidas', () => conApi(async (api) => {
    const r = await api.ejecutar('vencimiento-certificaciones');
    assert.deepEqual(r.detalle, { porVencer: 2, suspendidas: 1 });
    const paula = (await api.pedir('/soldadores')).cuerpo.data.find((s) => s.id === 2);
    assert.equal(paula.certificaciones[0].suspendida, true);
    assert.equal((await api.ejecutar('vencimiento-certificaciones')).detalle.suspendidas, 0);
  }));

  it('consumibles: crea ordenes una vez por consumible bajo el minimo', () => conApi(async (api) => {
    assert.deepEqual((await api.ejecutar('reponer-consumibles')).detalle, { ordenesCreadas: 2 });
    assert.deepEqual((await api.ejecutar('reponer-consumibles')).detalle, { ordenesCreadas: 0 });
    await api.json('/consumibles/2/consumo', { cantidad: 4 });
    const sinStock = await api.json('/consumibles/2/consumo', { cantidad: 50 });
    assert.equal(sinStock.cuerpo.codigo, 'STOCK_INSUFICIENTE');
    assert.deepEqual((await api.ejecutar('reponer-consumibles')).detalle, { ordenesCreadas: 1 });
    const ordenes = (await api.pedir('/ordenes-compra')).cuerpo.data;
    assert.deepEqual(ordenes.map((o) => [o.consumibleId, o.cantidad]), [[1, 60], [4, 4], [2, 15]]);
  }));

  it('el reloj del cron dispara los jobs y la limpieza borra alertas viejas', () => conApi(async (api) => {
    await api.ejecutar('revisar-mantenimiento');
    await api.pedir('/alertas/1/resolucion', { method: 'POST' });
    api.avanzar(8 * DIA);
    await api.planificador.tick();
    const limpieza = (await api.pedir('/jobs/limpiar-alertas/historial')).cuerpo.data[0];
    assert.equal(limpieza.origen, 'cron');
    assert.deepEqual(limpieza.detalle, { eliminadas: 1 });
    const job = (await api.pedir('/jobs/reponer-consumibles')).cuerpo.data;
    assert.equal(job.ejecuciones.exito, 1);
  }));

  it('pausa, reanuda y valida', () => conApi(async (api) => {
    const pausado = await api.pedir('/jobs/limpiar-alertas/pausa', { method: 'POST' });
    assert.equal(pausado.cuerpo.data.activo, false);
    const reanudado = await api.pedir('/jobs/limpiar-alertas/reanudacion', { method: 'POST' });
    assert.equal(reanudado.cuerpo.data.proximaEjecucion, '2026-11-06T03:00:00.000Z');
    assert.equal((await api.pedir('/jobs/no-existe')).cuerpo.codigo, 'JOB_NO_ENCONTRADO');
    assert.equal((await api.pedir('/jobs/MAL_NOMBRE')).status, 400);
    assert.equal((await api.json('/maquinas/1/uso', { horas: 30 })).status, 400);
    assert.equal((await api.pedir('/alertas?estado=rara')).status, 400);
    assert.equal((await api.pedir('/alertas/99/resolucion', { method: 'POST' })).cuerpo.codigo, 'ALERTA_NO_ENCONTRADA');
  }));
});

describe('vista previa de cron', () => {
  it('muestra las proximas fechas o explica el error', () => conApi(async (api) => {
    const r = await api.pedir(`/cron/proximas?expresion=${encodeURIComponent('*/30 6-20 * * 1-6')}&cantidad=3&desde=2026-11-07T20:00:00Z`);
    assert.deepEqual(r.cuerpo.data.proximas, ['2026-11-07T20:30:00.000Z', '2026-11-09T06:00:00.000Z', '2026-11-09T06:30:00.000Z']);
    const malo = await api.pedir(`/cron/proximas?expresion=${encodeURIComponent('61 * * * *')}`);
    assert.equal(malo.cuerpo.codigo, 'CRON_INVALIDO');
    const faltan = await api.pedir('/cron/proximas?cantidad=50&desde=ayer');
    assert.equal(faltan.cuerpo.errores.length, 3);
  }));
});
