import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/api.js';

let api;
before(async () => { api = await levantarApi(); });
after(async () => { await api.cerrar(); });

const MISION = { naveId: 2, destino: 'Titan', objetivo: 'Recolectar muestras de metano', prioridad: 'alta' };

describe('misiones', () => {
  it('responde la ruta base del ejercicio', async () => {
    const r = await api.pedir('/');
    assert.deepEqual(r.cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'observabilidad y logs' });
  });

  it('recorre el ciclo completo y registra cada evento', async () => {
    const c = await api.json('/misiones', MISION);
    assert.equal(c.status, 201);
    assert.equal(c.cabeceras.get('location'), `/avanzado/ejercicio-13/misiones/${c.cuerpo.data.id}`);
    assert.equal(c.cuerpo.data.estado, 'planificada');
    const id = c.cuerpo.data.id;

    const l = await api.pedir(`/misiones/${id}/lanzar`, { method: 'POST' });
    assert.equal(l.cuerpo.data.estado, 'en_curso');
    api.avanzar(90_000);

    const f = await api.json(`/misiones/${id}/finalizar`, { resultado: 'fallo', notas: 'tormenta' });
    assert.equal(f.status, 200);
    assert.equal(f.cuerpo.data.estado, 'fallida');
    const [fallo] = api.logsDe(f.cabeceras.get('x-request-id'));
    assert.equal(fallo.mensaje, 'mision.fallida');
    assert.equal(fallo.nivel, 'warn');
    assert.equal(fallo.duracionMs, 90_000);

    const filtradas = await api.pedir('/misiones?estado=fallida');
    assert.ok(filtradas.cuerpo.data.some((m) => m.id === id));
    const mala = await api.pedir('/misiones?estado=perdida');
    assert.equal(mala.status, 400);
  });

  it('no deja lanzar dos misiones a la vez en la misma nave', async () => {
    const a = await api.json('/misiones', { ...MISION, naveId: 5 });
    const b = await api.json('/misiones', { ...MISION, naveId: 5 });
    await api.pedir(`/misiones/${a.cuerpo.data.id}/lanzar`, { method: 'POST' });
    const r = await api.pedir(`/misiones/${b.cuerpo.data.id}/lanzar`, { method: 'POST' });
    assert.equal(r.status, 409);
    assert.equal(r.cuerpo.codigo, 'NAVE_OCUPADA');
    assert.equal(r.cuerpo.requestId, r.cabeceras.get('x-request-id'));
    const otra = await api.pedir(`/misiones/${a.cuerpo.data.id}/lanzar`, { method: 'POST' });
    assert.equal(otra.cuerpo.codigo, 'TRANSICION_INVALIDA');
    const sinLanzar = await api.json(`/misiones/${b.cuerpo.data.id}/finalizar`, { resultado: 'exito' });
    assert.equal(sinLanzar.cuerpo.codigo, 'TRANSICION_INVALIDA');
    await api.json(`/misiones/${a.cuerpo.data.id}/finalizar`, { resultado: 'exito' });
    const ahora = await api.pedir(`/misiones/${b.cuerpo.data.id}/lanzar`, { method: 'POST' });
    assert.equal(ahora.status, 200);
  });

  it('rechaza naves en mantenimiento o inexistentes', async () => {
    const m = await api.json('/misiones', { ...MISION, naveId: 4 });
    assert.equal(m.status, 409);
    assert.equal(m.cuerpo.codigo, 'NAVE_NO_DISPONIBLE');
    const n = await api.json('/misiones', { ...MISION, naveId: 99 });
    assert.equal(n.cuerpo.codigo, 'NAVE_NO_ENCONTRADA');
    const x = await api.pedir('/misiones/77');
    assert.equal(x.cuerpo.codigo, 'MISION_NO_ENCONTRADA');
  });

  it('valida el body y el formato', async () => {
    const v = await api.json('/misiones', { naveId: 0, destino: 'X', extra: true });
    assert.equal(v.status, 400);
    assert.deepEqual(v.cuerpo.errores.map((e) => e.campo).sort(), ['destino', 'extra', 'naveId', 'objetivo']);
    const t = await api.json('/naves/1/telemetria', { combustible: 120, temperaturaC: 'x' });
    assert.equal(t.cuerpo.errores.length, 3);
    const json = await api.pedir('/misiones', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{malo' });
    assert.equal(json.cuerpo.codigo, 'JSON_INVALIDO');
    const tipo = await api.pedir('/misiones', { method: 'POST', body: 'hola' });
    assert.equal(tipo.status, 415);
    const metodo = await api.pedir('/naves', { method: 'DELETE' });
    assert.equal(metodo.status, 405);
    assert.equal(metodo.cabeceras.get('allow'), 'GET');
    const ruta = await api.pedir('/agujero-negro');
    assert.equal(ruta.cuerpo.codigo, 'RUTA_NO_ENCONTRADA');
  });
});
