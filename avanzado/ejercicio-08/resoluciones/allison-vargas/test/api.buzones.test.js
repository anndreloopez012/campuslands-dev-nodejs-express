import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { esperarHasta } from '../soporte/datos.js';
import { levantarApi } from '../soporte/api.js';
import { SESION_BASE, VUELTA_BASE } from '../soporte/entorno.js';

const leerFlujo = async (respuesta, hasta) => {
  const lector = respuesta.body.getReader();
  const decodificador = new TextDecoder();
  let texto = '';
  while (!hasta(texto)) {
    const { value, done } = await lector.read();
    if (done) break;
    texto += decodificador.decode(value, { stream: true });
  }
  await lector.cancel();
  return texto;
};

describe('API de buzones', () => {
  let api;
  beforeEach(async () => { api = await levantarApi(); });
  afterEach(() => api.cerrar());

  it('crea un buzon, recibe eventos y se consulta', async () => {
    const creado = await api.json('/buzones', { nombre: 'alertas', eventos: ['vuelta:completada'], capacidad: 5 });
    assert.equal(creado.status, 201);
    assert.equal(creado.cabeceras.get('location'), '/avanzado/ejercicio-08/buzones/1');
    await api.json('/sesiones', SESION_BASE);
    await api.json('/sesiones/1/vueltas', VUELTA_BASE);
    const { cuerpo } = await api.pedir('/buzones/1');
    assert.equal(cuerpo.data.recibidos, 1);
    assert.equal(cuerpo.data.eventosGuardados[0].evento, 'vuelta:completada');
    const lista = await api.pedir('/buzones');
    assert.equal(lista.cuerpo.total, 1);
    assert.equal('eventosGuardados' in lista.cuerpo.data[0], false);
  });

  it('vaciar y eliminar un buzon', async () => {
    await api.json('/buzones', { nombre: 'todo', eventos: ['*'] });
    await api.json('/sesiones', SESION_BASE);
    assert.equal((await api.json('/buzones/1/vaciar', undefined)).cuerpo.data.guardados, 0);
    assert.equal((await api.pedir('/buzones/1', { method: 'DELETE' })).status, 204);
    assert.equal((await api.pedir('/buzones/1')).cuerpo.codigo, 'BUZON_NO_ENCONTRADO');
    assert.equal((await api.pedir('/bus')).cuerpo.data.porEvento['*'].suscriptores, 0);
  });

  it('un buzon con fallo simulado aparece en los fallos del bus', async () => {
    await api.json('/buzones', { nombre: 'roto', eventos: ['sesion:iniciada'], simularFallo: true });
    await api.json('/sesiones', SESION_BASE);
    const fallos = (await api.pedir('/bus/fallos')).cuerpo;
    assert.equal(fallos.total, 1);
    assert.equal(fallos.data[0].nombre, 'buzon:roto');
    const anunciados = await api.pedir('/eventos?evento=listener:error');
    assert.equal(anunciados.cuerpo.total, 1);
  });

  it('respeta el limite de suscriptores y de buzones', async () => {
    const chico = await levantarApi({ limites: { maxPorEvento: 4, profundidadMaxima: 6, capacidadHistorial: 500, maxBuzones: 2, maxVueltas: 50 } });
    try {
      assert.equal((await chico.json('/buzones', { nombre: 'uno', eventos: ['sesion:iniciada'] })).status, 201);
      assert.equal((await chico.json('/buzones', { nombre: 'dos', eventos: ['sesion:iniciada'] })).status, 201);
      const tercero = await chico.json('/buzones', { nombre: 'tres', eventos: ['sesion:iniciada'] });
      assert.equal(tercero.status, 409);
      assert.equal(tercero.cuerpo.codigo, 'LIMITE_DE_BUZONES');
      await chico.pedir('/buzones/2', { method: 'DELETE' });
      await chico.json('/buzones', { nombre: 'cuatro', eventos: ['sesion:iniciada'] });
      const lleno = await chico.json('/buzones', { nombre: 'cinco', eventos: ['sesion:iniciada'] });
      assert.equal(lleno.cuerpo.codigo, 'LIMITE_DE_BUZONES');
    } finally {
      await chico.cerrar();
    }
  });

  it('valida el cuerpo del buzon', async () => {
    const mala = await api.json('/buzones', {
      nombre: '!',
      eventos: ['nada', 'nada'],
      capacidad: 0,
      unaVez: 'si',
      otro: 1,
    });
    assert.equal(mala.status, 400);
    assert.deepEqual(mala.cuerpo.errores.map((e) => e.campo).sort(), ['capacidad', 'eventos', 'eventos[0]', 'eventos[1]', 'nombre', 'otro', 'unaVez']);
    assert.equal((await api.json('/buzones', { nombre: 'abc' })).cuerpo.errores[0].campo, 'eventos');
    assert.equal((await api.json('/buzones', { nombre: 'abc', eventos: 'x' })).status, 400);
    assert.equal((await api.json('/buzones', { nombre: 'abc', eventos: [] })).status, 400);
  });
});

describe('API del stream de eventos', () => {
  let api;
  beforeEach(async () => { api = await levantarApi(); });
  afterEach(() => api.cerrar());

  it('transmite los eventos en vivo con formato SSE', async () => {
    const respuesta = await fetch(`${api.origen}/avanzado/ejercicio-08/eventos/stream?eventos=sesion:iniciada`);
    assert.equal(respuesta.status, 200);
    assert.match(respuesta.headers.get('content-type'), /^text\/event-stream/);
    await esperarHasta(() => api.servicios.bus.estadisticas().porEvento['*'].suscriptores === 1);
    await api.json('/sesiones', SESION_BASE);
    await api.json('/sesiones/1/vueltas', VUELTA_BASE);
    const texto = await leerFlujo(respuesta, (t) => t.includes('event: sesion:iniciada'));
    assert.match(texto, /^: conectado/);
    assert.match(texto, /id: 1\nevent: sesion:iniciada\ndata: \{"seq":1/);
    assert.equal(texto.includes('vuelta:completada'), false);
    await esperarHasta(() => api.servicios.bus.estadisticas().porEvento['*'].suscriptores === 0);
  });

  it('repite lo que se perdio con desde o con Last-Event-ID', async () => {
    await api.json('/sesiones', SESION_BASE);
    await api.json('/sesiones/1/vueltas', VUELTA_BASE);
    const conDesde = await fetch(`${api.origen}/avanzado/ejercicio-08/eventos/stream?desde=1`);
    const texto = await leerFlujo(conDesde, (t) => t.includes('vuelta:completada'));
    assert.equal(texto.includes('event: sesion:iniciada'), false);
    assert.match(texto, /id: 2\nevent: vuelta:completada/);
    const conCabecera = await fetch(`${api.origen}/avanzado/ejercicio-08/eventos/stream`, { headers: { 'last-event-id': '0' } });
    const todo = await leerFlujo(conCabecera, (t) => t.includes('vuelta:completada'));
    assert.match(todo, /event: sesion:iniciada/);
  });

  it('rechaza filtros invalidos antes de abrir el flujo', async () => {
    const mala = await api.pedir('/eventos/stream?eventos=nada&desde=x');
    assert.equal(mala.status, 400);
    assert.deepEqual(mala.cuerpo.errores.map((e) => e.campo).sort(), ['desde', 'eventos']);
    const cabecera = await api.pedir('/eventos/stream', { headers: { 'last-event-id': 'abc' } });
    assert.equal(cabecera.cuerpo.errores[0].campo, 'Last-Event-ID');
  });

  it('el limite de suscriptores tambien protege el stream', async () => {
    const chico = await levantarApi({ limites: { maxPorEvento: 1, profundidadMaxima: 6, capacidadHistorial: 500, maxBuzones: 20, maxVueltas: 50 } });
    try {
      const primero = await fetch(`${chico.origen}/avanzado/ejercicio-08/eventos/stream`);
      await esperarHasta(() => chico.servicios.bus.estadisticas().porEvento['*'].suscriptores === 1);
      const segundo = await chico.pedir('/eventos/stream');
      assert.equal(segundo.status, 409);
      assert.equal(segundo.cuerpo.codigo, 'LIMITE_DE_SUSCRIPTORES');
      await primero.body.cancel();
    } finally {
      await chico.cerrar();
    }
  });
});
