import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/api.js';

describe('API de trabajos', () => {
  let api;
  beforeEach(async () => { api = await levantarApi(); });
  afterEach(() => api.cerrar());

  const nuevo = (extra = {}) => api.json('/trabajos', { tipo: 'cambio_aceite', carga: { litros: 2 }, ...extra });

  it('la ruta base responde el tema del ejercicio', async () => {
    const { status, cuerpo } = await api.pedir('/');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'colas de tareas conceptuales' });
  });

  it('encola un trabajo con 201 y Location', async () => {
    const { status, cuerpo, cabeceras } = await nuevo({ prioridad: 1 });
    assert.equal(status, 201);
    assert.equal(cabeceras.get('location'), '/avanzado/ejercicio-06/trabajos/1');
    assert.equal(cuerpo.duplicado, false);
    assert.equal(cuerpo.data.estado, 'pendiente');
    assert.equal(cuerpo.data.prioridad, 1);
  });

  it('una claveUnica repetida responde 200 con el mismo trabajo', async () => {
    await nuevo({ claveUnica: 'orden-9:aceite' });
    const repetido = await nuevo({ claveUnica: 'orden-9:aceite' });
    assert.equal(repetido.status, 200);
    assert.equal(repetido.cuerpo.duplicado, true);
    assert.equal(repetido.cuerpo.data.id, 1);
    assert.equal((await api.pedir('/trabajos')).cuerpo.paginacion.total, 1);
  });

  it('recorre el ciclo reclamar, extender y completar con el token', async () => {
    await nuevo();
    const reclamo = await api.json('/trabajadores/2/reclamar', {});
    assert.equal(reclamo.status, 200);
    const { token, id } = reclamo.cuerpo.data[0];
    assert.equal(token, 'tok-1');
    const extendido = await api.json(`/trabajos/${id}/extender`, { token });
    assert.equal(extendido.cuerpo.data.extensiones, 1);
    const malo = await api.json(`/trabajos/${id}/completar`, { token: 'otro' });
    assert.equal(malo.status, 409);
    assert.equal(malo.cuerpo.codigo, 'TOKEN_INVALIDO');
    const hecho = await api.json(`/trabajos/${id}/completar`, { token, resultado: { costo: 120 } });
    assert.equal(hecho.cuerpo.data.estado, 'completada');
    assert.deepEqual(hecho.cuerpo.data.resultado, { costo: 120 });
    const detalle = await api.pedir(`/trabajos/${id}`);
    assert.equal(detalle.cuerpo.data.historial.at(-1).evento, 'completada');
  });

  it('un fallo reprograma y con definitivo mata el trabajo', async () => {
    await nuevo();
    const [t] = (await api.json('/trabajadores/2/reclamar', {})).cuerpo.data;
    const fallo = await api.json(`/trabajos/${t.id}/fallar`, { token: t.token, mensaje: 'tuerca barrida' });
    assert.equal(fallo.cuerpo.data.estado, 'programada');
    api.avanzar(1000);
    const [otra] = (await api.json('/trabajadores/2/reclamar', {})).cuerpo.data;
    const muerto = await api.json(`/trabajos/${t.id}/fallar`, { token: otra.token, definitivo: true });
    assert.equal(muerto.cuerpo.data.estado, 'muerta');
    const cola = await api.pedir('/muertas');
    assert.equal(cola.cuerpo.total, 1);
    const revivido = await api.json(`/trabajos/${t.id}/reencolar`, undefined);
    assert.equal(revivido.status, 200);
    assert.equal(revivido.cuerpo.data.estado, 'pendiente');
    assert.equal((await api.pedir('/muertas')).cuerpo.total, 0);
  });

  it('cancelar y reencolar aplican sus reglas de estado', async () => {
    await nuevo();
    const noMuerto = await api.json('/trabajos/1/reencolar', undefined);
    assert.equal(noMuerto.status, 409);
    assert.equal(noMuerto.cuerpo.codigo, 'TRABAJO_NO_MUERTO');
    const cancelado = await api.json('/trabajos/1/cancelar', undefined);
    assert.equal(cancelado.cuerpo.data.estado, 'cancelada');
    const otra = await api.json('/trabajos/1/cancelar', undefined);
    assert.equal(otra.cuerpo.codigo, 'TRABAJO_FINALIZADO');
  });

  it('lista con filtros y paginacion', async () => {
    await nuevo({ prioridad: 0 });
    await api.json('/trabajos', { tipo: 'lavado' });
    await nuevo();
    const lavados = await api.pedir('/trabajos?tipo=lavado');
    assert.deepEqual(lavados.cuerpo.data.map((t) => t.id), [2]);
    const urgentes = await api.pedir('/trabajos?prioridad=0');
    assert.deepEqual(urgentes.cuerpo.data.map((t) => t.id), [1]);
    const pagina = await api.pedir('/trabajos?limite=2&pagina=2');
    assert.deepEqual(pagina.cuerpo.data.map((t) => t.id), [3]);
    assert.equal(pagina.cabeceras.get('x-total-count'), '3');
    const mala = await api.pedir('/trabajos?estado=perdido');
    assert.equal(mala.status, 400);
  });

  it('valida el body al encolar', async () => {
    const { status, cuerpo } = await api.json('/trabajos', {
      tipo: 'frenos',
      carga: { eje: 'lateral', extra: 1 },
      prioridad: 9,
      claveUnica: 'a b',
      dependeDe: [1, 1],
      otro: true,
    });
    assert.equal(status, 400);
    assert.equal(cuerpo.codigo, 'VALIDACION');
    const campos = cuerpo.errores.map((e) => e.campo).sort();
    assert.deepEqual(campos, ['carga.eje', 'carga.extra', 'claveUnica', 'dependeDe', 'otro', 'prioridad']);
  });

  it('valida los datos de fallar y completar', async () => {
    const sin = await api.json('/trabajos/1/completar', {});
    assert.equal(sin.status, 400);
    const mal = await api.json('/trabajos/1/fallar', { token: 'x', definitivo: 'si', mensaje: '' });
    assert.deepEqual(mal.cuerpo.errores.map((e) => e.campo).sort(), ['definitivo', 'mensaje']);
    const res = await api.json('/trabajos/1/completar', { token: 'x', resultado: [] });
    assert.equal(res.cuerpo.errores[0].campo, 'resultado');
  });

  it('dependencias inexistentes o fallidas son 422', async () => {
    const falta = await nuevo({ dependeDe: [5] });
    assert.equal(falta.status, 422);
    assert.equal(falta.cuerpo.codigo, 'DEPENDENCIA_NO_ENCONTRADA');
    await nuevo();
    await api.json('/trabajos/1/cancelar', undefined);
    const fallida = await nuevo({ dependeDe: [1] });
    assert.equal(fallida.cuerpo.codigo, 'DEPENDENCIA_FALLIDA');
  });

  it('ids invalidos o inexistentes', async () => {
    assert.equal((await api.pedir('/trabajos/abc')).status, 400);
    assert.equal((await api.pedir('/trabajos/0')).status, 400);
    const nada = await api.pedir('/trabajos/44');
    assert.equal(nada.status, 404);
    assert.deepEqual(nada.cuerpo.contexto, { trabajoId: 44 });
  });
});

describe('API: protocolo', () => {
  let api;
  const interno = [];
  beforeEach(async () => {
    interno.length = 0;
    api = await levantarApi({ registro: (e) => interno.push(e) });
  });
  afterEach(() => api.cerrar());

  it('405 con Allow, OPTIONS 204 y 404 para rutas desconocidas', async () => {
    const metodo = await api.pedir('/trabajos', { method: 'DELETE' });
    assert.equal(metodo.status, 405);
    assert.equal(metodo.cabeceras.get('allow'), 'GET, POST');
    const opciones = await api.pedir('/trabajos', { method: 'OPTIONS' });
    assert.equal(opciones.status, 204);
    const nada = await api.pedir('/nada');
    assert.equal(nada.status, 404);
    assert.equal(nada.cuerpo.codigo, 'RUTA_NO_ENCONTRADA');
  });

  it('415 si no es JSON, 400 si el JSON esta roto y 413 si es enorme', async () => {
    const texto = await api.pedir('/trabajos', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' });
    assert.equal(texto.status, 415);
    const roto = await api.pedir('/trabajos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"tipo":' });
    assert.equal(roto.status, 400);
    assert.equal(roto.cuerpo.codigo, 'JSON_INVALIDO');
    const grande = await api.json('/trabajos', { tipo: 'lavado', relleno: 'x'.repeat(11000) });
    assert.equal(grande.status, 413);
  });

  it('un fallo inesperado responde un 500 generico y se registra aparte', async () => {
    api.servicios.trabajos.listar = () => { throw new Error('se cayo el taller'); };
    const { status, cuerpo } = await api.pedir('/trabajos');
    assert.equal(status, 500);
    assert.deepEqual(cuerpo, { ok: false, message: 'Error interno del servidor', codigo: 'ERROR_INTERNO' });
    assert.equal(interno.length, 1);
    assert.equal(interno[0].mensaje, 'se cayo el taller');
  });

  it('no expone la cabecera x-powered-by', async () => {
    const { cabeceras } = await api.pedir('/');
    assert.equal(cabeceras.get('x-powered-by'), null);
  });
});
