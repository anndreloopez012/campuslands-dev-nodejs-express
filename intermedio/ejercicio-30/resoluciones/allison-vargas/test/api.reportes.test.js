import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarTaller } from '../soporte/taller.js';

describe('mecanicos y reportes', () => {
  let taller;
  let admin;
  let lucia;

  beforeEach(async () => {
    taller = await levantarTaller();
    admin = await taller.como('admin');
    lucia = await taller.como('lucia');
  });

  afterEach(() => taller.cerrar());

  it('lista los mecanicos activos con su carga de trabajo', async () => {
    const { status, cuerpo } = await lucia.get('/mecanicos');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo.data, [
      { id: 3, nombre: 'Carlos Perez', ordenesActivas: 0 },
      { id: 4, nombre: 'Marta Lopez', ordenesActivas: 1 },
    ]);
    await lucia.put('/ordenes/3/asignacion', { mecanicoId: 3 });
    const despues = await lucia.get('/mecanicos');
    assert.deepEqual(despues.cuerpo.data.map((m) => m.ordenesActivas), [1, 1]);
    assert.equal((await lucia.post('/mecanicos', {})).status, 405);
  });

  it('el resumen del taller es solo para admin', async () => {
    const { status, cuerpo } = await admin.get('/reportes/resumen');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo.data, {
      ordenes: {
        total: 3,
        porEstado: { recibida: 1, asignada: 0, en_reparacion: 1, lista: 0, entregada: 1, cancelada: 0 },
      },
      ingresos: 38,
      repuestosBajoStock: [
        { id: 6, codigo: 'LLA-90-R17', nombre: 'Llanta trasera 90/90 R17', stock: 0 },
        { id: 4, codigo: 'PAS-FRE-DL', nombre: 'Pastillas de freno delanteras', stock: 3 },
      ],
    });
    assert.equal((await lucia.get('/reportes/resumen')).status, 403);
    const metodo = await admin.post('/reportes/resumen', {});
    assert.equal(metodo.status, 405);
    assert.equal(metodo.cabeceras.get('allow'), 'GET');
  });

  it('el resumen se actualiza con el trabajo del taller', async () => {
    const marta = await taller.como('marta');
    await marta.post('/ordenes/2/items', { repuestoId: 4, cantidad: 3 });
    await marta.post('/ordenes/2/horas', { horas: 2 });
    await marta.put('/ordenes/2/estado', { estado: 'lista' });
    await lucia.put('/ordenes/2/estado', { estado: 'entregada' });
    const { cuerpo } = await admin.get('/reportes/resumen');
    assert.equal(cuerpo.data.ingresos, 38 + 42 + 90);
    assert.equal(cuerpo.data.ordenes.porEstado.entregada, 2);
    assert.equal(cuerpo.data.repuestosBajoStock[1].stock, 0);
  });

  it('rutas desconocidas responden 404 con sesion y 401 sin ella en las protegidas', async () => {
    assert.equal((await admin.get('/camiones')).status, 404);
    assert.equal((await admin.get('/ordenes/1/otra')).status, 404);
    assert.equal((await taller.anonimo.get('/ordenes/1/otra')).status, 401);
  });

  it('rechaza un JSON mal formado y un body demasiado grande', async () => {
    const headers = { authorization: `Bearer ${admin.token}`, 'content-type': 'application/json' };
    const roto = await taller.cliente.pedir('/clientes', { method: 'POST', headers, body: '{"nombre":' });
    assert.equal(roto.status, 400);
    const grande = await taller.cliente.pedir('/clientes', { method: 'POST', headers, body: JSON.stringify({ nombre: 'x'.repeat(20000) }) });
    assert.equal(grande.status, 413);
  });
});
