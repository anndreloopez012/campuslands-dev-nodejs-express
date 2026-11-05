import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/api.js';
import { SESION_BASE, VUELTA_BASE } from '../soporte/entorno.js';

describe('API de sesiones y eventos', () => {
  let api;
  beforeEach(async () => { api = await levantarApi(); });
  afterEach(() => api.cerrar());

  const vuelta = (id, datos = {}) => api.json(`/sesiones/${id}/vueltas`, { ...VUELTA_BASE, ...datos });

  it('la ruta base responde el tema del ejercicio', async () => {
    const { status, cuerpo } = await api.pedir('/');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'event emitter' });
  });

  it('expone el catalogo de circuitos, autos y records', async () => {
    assert.equal((await api.pedir('/circuitos')).cuerpo.total, 5);
    assert.equal((await api.pedir('/circuitos')).cuerpo.data[1].record.tiempoMs, 84000);
    assert.equal((await api.pedir('/autos')).cuerpo.total, 8);
    assert.equal((await api.pedir('/records')).cuerpo.total, 5);
  });

  it('crea una sesion, registra vueltas y la finaliza', async () => {
    const creada = await api.json('/sesiones', SESION_BASE);
    assert.equal(creada.status, 201);
    assert.equal(creada.cabeceras.get('location'), '/avanzado/ejercicio-08/sesiones/1');
    const lap = await vuelta(1);
    assert.equal(lap.status, 201);
    assert.equal(lap.cuerpo.data.vueltas.length, 1);
    const cierre = await api.json('/sesiones/1/finalizar', undefined);
    assert.equal(cierre.cuerpo.data.estado, 'finalizada');
    const otra = await vuelta(1);
    assert.equal(otra.status, 409);
    assert.equal(otra.cuerpo.codigo, 'SESION_CERRADA');
  });

  it('el sobrecalentamiento aborta la sesion y la respuesta ya lo refleja', async () => {
    await api.json('/sesiones', SESION_BASE);
    await vuelta(1, { tempMotor: 130 });
    const segunda = await vuelta(1, { tempMotor: 135 });
    assert.equal(segunda.cuerpo.data.estado, 'abortada');
    assert.equal(segunda.cuerpo.data.motivo, 'sobrecalentamiento del motor');
  });

  it('abortar y finalizar aceptan un motivo', async () => {
    await api.json('/sesiones', SESION_BASE);
    await api.json('/sesiones', SESION_BASE);
    const abortada = await api.json('/sesiones/1/abortar', { motivo: 'bandera roja' });
    assert.equal(abortada.cuerpo.data.motivo, 'bandera roja');
    const finalizada = await api.json('/sesiones/2/finalizar', { motivo: 'fin de turno' });
    assert.equal(finalizada.cuerpo.data.motivo, 'fin de turno');
    assert.equal((await api.json('/sesiones/2/abortar', { motivo: 'x' })).status, 400);
  });

  it('lista sesiones con filtros', async () => {
    await api.json('/sesiones', SESION_BASE);
    await api.json('/sesiones', { ...SESION_BASE, circuitoId: 3 });
    await api.json('/sesiones/1/abortar', undefined);
    assert.equal((await api.pedir('/sesiones')).cabeceras.get('x-total-count'), '2');
    assert.deepEqual((await api.pedir('/sesiones?estado=en_pista')).cuerpo.data.map((s) => s.id), [2]);
    assert.deepEqual((await api.pedir('/sesiones?circuitoId=3')).cuerpo.data.map((s) => s.id), [2]);
    assert.equal((await api.pedir('/sesiones?circuitoId=99')).status, 400);
    assert.equal((await api.pedir('/sesiones?estado=perdida')).status, 400);
  });

  it('el historial de eventos se consulta con filtros y cursor', async () => {
    await api.json('/sesiones', SESION_BASE);
    await api.json('/sesiones', SESION_BASE);
    await vuelta(1);
    await vuelta(2);
    const todos = await api.pedir('/eventos');
    assert.deepEqual(todos.cuerpo.data.map((e) => e.evento), ['sesion:iniciada', 'sesion:iniciada', 'vuelta:completada', 'vuelta:completada']);
    const filtrados = await api.pedir('/eventos?evento=vuelta:completada&sesionId=2');
    assert.deepEqual(filtrados.cuerpo.data.map((e) => e.seq), [4]);
    const pagina = await api.pedir('/eventos?limite=3');
    assert.equal(pagina.cuerpo.siguiente, 3);
    const resto = await api.pedir(`/eventos?limite=3&desde=${pagina.cuerpo.siguiente}`);
    assert.deepEqual(resto.cuerpo.data.map((e) => e.seq), [4]);
    assert.equal(resto.cuerpo.siguiente, null);
  });

  it('un evento se consulta por su secuencia', async () => {
    await api.json('/sesiones', SESION_BASE);
    const { status, cuerpo } = await api.pedir('/eventos/1');
    assert.equal(status, 200);
    assert.equal(cuerpo.data.evento, 'sesion:iniciada');
    const nada = await api.pedir('/eventos/99');
    assert.equal(nada.status, 404);
    assert.equal(nada.cuerpo.codigo, 'EVENTO_NO_ENCONTRADO');
  });

  it('muestra el estado del bus, sus suscripciones y fallos', async () => {
    await api.json('/sesiones', SESION_BASE);
    const bus = (await api.pedir('/bus')).cuerpo.data;
    assert.equal(bus.emitidos, 1);
    assert.equal(bus.porEvento['vuelta:completada'].suscriptores, 3);
    const subs = (await api.pedir('/bus/suscripciones?evento=vuelta:completada')).cuerpo;
    assert.deepEqual(subs.data.map((s) => s.nombre), ['termica', 'neumaticos', 'cronometro']);
    assert.ok(subs.data.every((s) => s.interna));
    assert.equal((await api.pedir('/bus/fallos')).cuerpo.total, 0);
  });

  it('valida los datos de sesion y de vuelta', async () => {
    const mala = await api.json('/sesiones', { piloto: 'x', auto: 'lada', circuitoId: 9, extra: 1 });
    assert.equal(mala.status, 400);
    assert.deepEqual(mala.cuerpo.errores.map((e) => e.campo).sort(), ['auto', 'circuitoId', 'extra', 'piloto']);
    await api.json('/sesiones', SESION_BASE);
    const lap = await vuelta(1, { tiempoMs: 10, tempMotor: 500, desgaste: 101 });
    assert.deepEqual(lap.cuerpo.errores.map((e) => e.campo).sort(), ['desgaste', 'tempMotor', 'tiempoMs']);
    assert.equal((await api.json('/sesiones/1/vueltas', [])).status, 400);
    assert.equal((await vuelta(77)).status, 404);
    assert.equal((await api.pedir('/sesiones/abc')).status, 400);
  });

  it('valida los filtros de eventos', async () => {
    const { status, cuerpo } = await api.pedir('/eventos?evento=nada&sesionId=0&desde=x&limite=500');
    assert.equal(status, 400);
    assert.deepEqual(cuerpo.errores.map((e) => e.campo).sort(), ['desde', 'evento', 'limite', 'sesionId']);
  });
});
