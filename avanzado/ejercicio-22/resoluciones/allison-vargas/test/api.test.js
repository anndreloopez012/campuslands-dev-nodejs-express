import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp, crearServicios } from '../src/app.js';
import { firmar } from '../src/webhooks/firma.js';
import { levantar } from '../soporte/cliente.js';

const BASE = '/avanzado/ejercicio-22';

async function esperarHasta(condicion) {
  for (let i = 0; i < 300; i += 1) {
    if (await condicion()) return;
    await new Promise((r) => { setTimeout(r, 5); });
  }
  throw new Error('la condicion nunca se cumplio');
}

// prueba de punta a punta: la API envia webhooks reales por HTTP a su propio receptor simulado
async function conApi(prueba, opciones = {}) {
  const servicios = crearServicios({ politica: { maxIntentos: 4, baseMs: 10, factor: 2, timeoutMs: 1000 }, permitirLocal: true, ...opciones });
  const api = await levantar(crearApp({ servicios, registro: () => {} }));
  const recibidos = async () => (await api.pedir('/receptor/recibidos')).cuerpo.data;
  try {
    await prueba({ ...api, servicios, recibidos });
  } finally {
    await api.cerrar();
  }
}

async function suscribirReceptor(api, eventos = ['*']) {
  const sus = await api.json('/suscripciones', { url: `${api.origen}${BASE}/receptor`, eventos, descripcion: 'receptor local' });
  await api.json('/receptor/configuracion', { secretos: [sus.cuerpo.data.secreto] }, 'PUT');
  return sus.cuerpo.data;
}

describe('de punta a punta', () => {
  it('un cambio del dominio llega firmado al receptor', () => conApi(async (api) => {
    await suscribirReceptor(api);
    const p = await api.json('/proyectos', { nombre: 'Museo del Agua', cliente: 'Municipalidad', tipo: 'museo' });
    assert.equal(p.status, 201);
    await api.json(`/proyectos/${p.cuerpo.data.proyecto.id}/planos`, { nombre: 'Planta baja', nivel: 0 });
    await api.pedir(`/proyectos/${p.cuerpo.data.proyecto.id}/aprobacion`, { method: 'POST' });
    await esperarHasta(async () => (await api.recibidos()).recibidos.length === 3);
    const { recibidos, rechazos } = await api.recibidos();
    assert.deepEqual(recibidos.map((r) => r.tipo), ['proyecto.creado', 'plano.publicado', 'proyecto.aprobado']);
    assert.equal(recibidos[0].id, p.cuerpo.data.eventoId);
    assert.equal(rechazos.length, 0);
    const otra = await api.pedir(`/proyectos/${p.cuerpo.data.proyecto.id}/aprobacion`, { method: 'POST' });
    assert.equal(otra.cuerpo.codigo, 'PROYECTO_YA_APROBADO');
  }));

  it('si el receptor falla se reintenta hasta entregar', () => conApi(async (api) => {
    await suscribirReceptor(api);
    await api.json('/receptor/configuracion', { fallarProximos: 2 }, 'PUT');
    await api.json('/proyectos', { nombre: 'Escuela Rural', cliente: 'Fundacion Sur', tipo: 'escuela' });
    await esperarHasta(async () => (await api.recibidos()).recibidos.length === 1);
    const [recibido] = (await api.recibidos()).recibidos;
    assert.equal(recibido.intento, 3);
    const [entrega] = (await api.pedir('/entregas')).cuerpo.data;
    assert.deepEqual(entrega.intentos.map((i) => i.status), [503, 503, 200]);
  }));

  it('agota los intentos, queda fallida y se puede reintentar a mano', () => conApi(async (api) => {
    await suscribirReceptor(api);
    await api.json('/receptor/configuracion', { fallarProximos: 4 }, 'PUT');
    await api.json('/proyectos', { nombre: 'Torre Norte', cliente: 'Inmobiliaria X', tipo: 'oficina' });
    await esperarHasta(async () => (await api.pedir('/entregas?estado=fallida')).cuerpo.data.length === 1);
    const [fallida] = (await api.pedir('/entregas?estado=fallida')).cuerpo.data;
    const r = await api.pedir(`/entregas/${fallida.id}/reintento`, { method: 'POST' });
    assert.equal(r.status, 202);
    await esperarHasta(async () => (await api.pedir(`/entregas/${fallida.id}`)).cuerpo.data.estado === 'entregada');
    assert.equal((await api.pedir('/entregas?estado=raro')).status, 400);
    assert.equal((await api.pedir('/entregas/ent_x')).status, 400);
  }));

  it('el receptor puede pedir que no le envien mas (410)', () => conApi(async (api) => {
    const sus = await suscribirReceptor(api);
    await api.json('/receptor/configuracion', { responderGone: true }, 'PUT');
    await api.pedir(`/suscripciones/${sus.id}/prueba`, { method: 'POST' });
    await esperarHasta(async () => (await api.pedir(`/suscripciones/${sus.id}`)).cuerpo.data.activa === false);
    assert.equal((await api.pedir(`/suscripciones/${sus.id}`)).cuerpo.data.desactivadaPor, 'el receptor respondio 410');
    await api.pedir(`/suscripciones/${sus.id}/reactivacion`, { method: 'POST' });
    assert.equal((await api.pedir(`/suscripciones/${sus.id}`)).cuerpo.data.activa, true);
    assert.equal((await api.pedir(`/suscripciones/${sus.id}`, { method: 'DELETE' })).status, 204);
  }));
});

describe('receptor', () => {
  const evento = JSON.stringify({ id: 'evt_manual', tipo: 'ping', datos: {} });
  const enviar = (api, cuerpo, firma, id = 'evt_manual') => api.pedir('/receptor', {
    method: 'POST',
    headers: {
      'content-type': 'application/json', 'x-firma': firma, 'x-webhook-id': id, 'x-webhook-intento': '1',
    },
    body: cuerpo,
  });

  it('verifica la firma sobre el body exacto, rechaza viejos y descarta duplicados', () => conApi(async (api) => {
    await api.json('/receptor/configuracion', { secretos: ['whsec_prueba'] }, 'PUT');
    const ahora = Math.floor(Date.now() / 1000);
    const buena = firmar('whsec_prueba', evento, ahora);
    assert.equal((await enviar(api, evento, buena)).status, 200);
    const dup = await enviar(api, evento, buena);
    assert.deepEqual(dup.cuerpo, { ok: true, duplicado: true });
    const espaciado = JSON.stringify(JSON.parse(evento), null, 2);
    assert.equal((await enviar(api, espaciado, buena)).status, 401);
    const vieja = await enviar(api, evento, firmar('whsec_prueba', evento, ahora - 600), 'evt_otro');
    assert.equal(vieja.cuerpo.motivo, 'timestamp fuera de tolerancia');
    assert.equal((await enviar(api, evento, firmar('whsec_otro', evento, ahora), 'evt_otro')).status, 401);
    const { recibidos, rechazos } = await api.recibidos();
    assert.equal(recibidos.length, 1);
    assert.equal(rechazos.length, 3);
  }));
});

describe('validaciones', () => {
  it('valida suscripciones, ids y configuracion', () => conApi(async (api) => {
    const mala = await api.json('/suscripciones', { url: 'ftp://x', eventos: ['proyecto.borrado'] });
    assert.deepEqual(mala.cuerpo.errores.map((e) => e.campo), ['url', 'eventos']);
    assert.equal((await api.pedir('/suscripciones/123')).status, 400);
    assert.equal((await api.pedir('/suscripciones/sus_0000000000000000')).status, 404);
    const config = await api.json('/receptor/configuracion', { secretos: ['abc'], fallarProximos: 99 }, 'PUT');
    assert.equal(config.cuerpo.errores.length, 2);
    await api.json('/proyectos', { nombre: 'Casa Patio', cliente: 'Familia Rojas', tipo: 'vivienda' });
    const plano = await api.json('/proyectos/1/planos', { nombre: 'X', nivel: 1.5 });
    assert.equal(plano.status, 400);
    assert.equal((await api.json('/proyectos/9/planos', { nombre: 'Planta', nivel: 1 })).cuerpo.codigo, 'PROYECTO_NO_ENCONTRADO');
    assert.equal((await api.pedir('/')).cuerpo.topic, 'webhooks simulados');
  }));

  it('fuera del modo local solo acepta https publicas', () => conApi(async (api) => {
    const local = await api.json('/suscripciones', { url: 'http://localhost:9999/x', eventos: ['*'] });
    assert.equal(local.cuerpo.errores[0].mensaje, 'no se permiten direcciones internas');
    const ok = await api.json('/suscripciones', { url: 'https://hooks.cliente.test/arq', eventos: ['plano.publicado', 'plano.publicado'] });
    assert.deepEqual(ok.cuerpo.data.eventos, ['plano.publicado']);
    assert.equal((await api.pedir('/eventos')).cuerpo.data.length, 0);
  }, { permitirLocal: false }));
});
