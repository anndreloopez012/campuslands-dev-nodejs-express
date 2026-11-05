import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { COMISION, conApi } from '../soporte/api.js';

const DIA = 24 * 60 * 60 * 1000;

async function comisionPagable(api, clave = 'comision-0001') {
  const r = await api.enviar('/comisiones', COMISION, { clave });
  return r.cuerpo.data;
}

describe('reglas de la cabecera', () => {
  it('exige cliente y una clave con formato valido', () => conApi(async (api) => {
    assert.equal((await api.enviar('/comisiones', COMISION)).cuerpo.codigo, 'CLAVE_IDEMPOTENCIA_REQUERIDA');
    assert.equal((await api.enviar('/comisiones', COMISION, { clave: 'corta' })).cuerpo.codigo, 'CLAVE_IDEMPOTENCIA_INVALIDA');
    assert.equal((await api.enviar('/comisiones', COMISION, { clave: 'x'.repeat(65) })).status, 400);
    assert.equal((await api.enviar('/comisiones', COMISION, { clave: 'clave-valida', cliente: null })).status, 401);
    assert.equal((await api.pedir('/')).cuerpo.topic, 'idempotencia');
  }));
});

describe('crear comisiones', () => {
  it('repetir la misma peticion devuelve la misma respuesta sin crear otra', () => conApi(async (api) => {
    const primera = await api.enviar('/comisiones', COMISION, { clave: 'reintento-0001' });
    assert.equal(primera.status, 201);
    assert.equal(primera.cuerpo.data.precio, 91000);
    assert.equal(primera.cabeceras.get('idempotent-replayed'), null);
    const { descripcion, ...resto } = COMISION;
    const segunda = await api.enviar('/comisiones', { descripcion, ...resto }, { clave: 'reintento-0001' });
    assert.equal(segunda.status, 201);
    assert.equal(segunda.cabeceras.get('idempotent-replayed'), 'true');
    assert.equal(segunda.cabeceras.get('location'), primera.cabeceras.get('location'));
    assert.match(segunda.cabeceras.get('content-type'), /application\/json/);
    assert.deepEqual(segunda.cuerpo, primera.cuerpo);
    const lista = await api.pedir('/comisiones', { headers: { 'x-cliente-id': 'cliente-uno' } });
    assert.equal(lista.cuerpo.data.length, 1);
  }));

  it('la misma clave con otro body es un error del cliente (422)', () => conApi(async (api) => {
    await api.enviar('/comisiones', COMISION, { clave: 'reintento-0002' });
    const otra = await api.enviar('/comisiones', { ...COMISION, urgente: true }, { clave: 'reintento-0002' });
    assert.equal(otra.status, 422);
    assert.equal(otra.cuerpo.codigo, 'CLAVE_REUTILIZADA');
    const otraRuta = await api.enviar('/pagos', { comisionId: 1, monto: 1000 }, { clave: 'reintento-0002' });
    assert.equal(otraRuta.status, 422);
  }));

  it('las claves son por cliente y vencen a las 24 horas', () => conApi(async (api) => {
    const a = await api.enviar('/comisiones', COMISION, { clave: 'compartida-01', cliente: 'cliente-uno' });
    const b = await api.enviar('/comisiones', COMISION, { clave: 'compartida-01', cliente: 'cliente-dos' });
    assert.notEqual(a.cuerpo.data.id, b.cuerpo.data.id);
    api.avanzar(DIA);
    const despues = await api.enviar('/comisiones', COMISION, { clave: 'compartida-01', cliente: 'cliente-uno' });
    assert.equal(despues.cabeceras.get('idempotent-replayed'), null);
    assert.equal(despues.cuerpo.data.id, 3);
  }));

  it('un error de validacion tambien se guarda como respuesta', () => conApi(async (api) => {
    const malo = { ...COMISION, tipo: 'mural' };
    const r1 = await api.enviar('/comisiones', malo, { clave: 'invalida-001' });
    const r2 = await api.enviar('/comisiones', malo, { clave: 'invalida-001' });
    assert.equal(r1.status, 400);
    assert.equal(r2.status, 400);
    assert.equal(r2.cabeceras.get('idempotent-replayed'), 'true');
  }));
});

describe('pagos', () => {
  it('dos envios simultaneos con la misma clave cobran una sola vez', () => conApi(async (api) => {
    const comision = await comisionPagable(api);
    const pago = { comisionId: comision.id, monto: 50000 };
    const primera = api.enviar('/pagos', pago, { clave: 'pago-doble-click' });
    const cobro = await api.pasarela.esperarPendiente();
    const segunda = await api.enviar('/pagos', pago, { clave: 'pago-doble-click' });
    assert.equal(segunda.status, 409);
    assert.equal(segunda.cuerpo.codigo, 'PETICION_EN_CURSO');
    assert.equal(segunda.cabeceras.get('retry-after'), '1');
    cobro.resolver();
    const r1 = await primera;
    assert.equal(r1.status, 201);
    assert.equal(r1.cuerpo.data.comision.saldo, 41000);
    const tercera = await api.enviar('/pagos', pago, { clave: 'pago-doble-click' });
    assert.equal(tercera.cabeceras.get('idempotent-replayed'), 'true');
    assert.equal(tercera.cuerpo.data.pago.id, r1.cuerpo.data.pago.id);
    assert.equal(api.pasarela.cobros.length, 1);
  }));

  it('si la pasarela falla (5xx) la clave se libera y el reintento cobra', () => conApi(async (api) => {
    const comision = await comisionPagable(api);
    const pago = { comisionId: comision.id, monto: comision.precio };
    const intento = api.enviar('/pagos', pago, { clave: 'pago-con-falla' });
    (await api.pasarela.esperarPendiente()).fallar();
    const fallido = await intento;
    assert.equal(fallido.status, 502);
    assert.equal(fallido.cuerpo.codigo, 'PASARELA_NO_DISPONIBLE');
    const reintento = api.enviar('/pagos', pago, { clave: 'pago-con-falla' });
    (await api.pasarela.esperarPendiente()).resolver();
    const ok = await reintento;
    assert.equal(ok.status, 201);
    assert.equal(ok.cabeceras.get('idempotent-replayed'), null);
    assert.equal(ok.cuerpo.data.comision.estado, 'pagada');
  }));

  it('claves distintas sobre la misma comision no pueden pagar de mas', () => conApi(async (api) => {
    const comision = await comisionPagable(api);
    const pago = { comisionId: comision.id, monto: comision.precio };
    const a = api.enviar('/pagos', pago, { clave: 'pestana-uno-01' });
    const b = api.enviar('/pagos', pago, { clave: 'pestana-dos-01' });
    (await api.pasarela.esperarPendiente()).resolver();
    const [ra, rb] = await Promise.all([a, b]);
    assert.deepEqual([ra.status, rb.status].sort(), [201, 409]);
    assert.equal([ra, rb].find((r) => r.status === 409).cuerpo.codigo, 'PAGO_EXCEDE_SALDO');
    assert.equal(api.pasarela.cobros.length, 1);
    const pagos = await api.pedir(`/pagos?comisionId=${comision.id}`);
    assert.equal(pagos.cuerpo.data.length, 1);
    assert.equal((await api.pedir('/pagos?comisionId=x')).status, 400);
  }));
});

describe('idempotencia natural de PUT', () => {
  it('pedir el mismo estado dos veces no cambia nada ni da error', () => conApi(async (api) => {
    const comision = await comisionPagable(api);
    const pago = api.enviar('/pagos', { comisionId: comision.id, monto: comision.precio }, { clave: 'pago-total-01' });
    (await api.pasarela.esperarPendiente()).resolver();
    await pago;
    const r1 = await api.json(`/comisiones/${comision.id}/estado`, { estado: 'en_progreso' }, 'PUT');
    const r2 = await api.json(`/comisiones/${comision.id}/estado`, { estado: 'en_progreso' }, 'PUT');
    assert.deepEqual([r1.cuerpo.cambio, r2.cuerpo.cambio], [true, false]);
    assert.equal(r2.cuerpo.data.estado, 'en_progreso');
    const salto = await api.json(`/comisiones/${comision.id}/estado`, { estado: 'pendiente_pago' }, 'PUT');
    assert.equal(salto.cuerpo.codigo, 'TRANSICION_INVALIDA');
    assert.equal((await api.pedir('/comisiones/99')).cuerpo.codigo, 'COMISION_NO_ENCONTRADA');
    const artista = await api.enviar('/comisiones', { ...COMISION, artistaId: 9 }, { clave: 'artista-falso' });
    assert.equal(artista.cuerpo.codigo, 'ARTISTA_NO_ENCONTRADO');
    assert.equal((await api.pedir('/artistas')).cuerpo.data.length, 3);
  }));
});
