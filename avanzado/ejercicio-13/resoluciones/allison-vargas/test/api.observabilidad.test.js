import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/api.js';
import { crearServicios } from '../src/services/index.js';
import { REDACTADO } from '../src/observabilidad/redaccion.js';

let api;
before(async () => { api = await levantarApi(); });
after(async () => { await api.cerrar(); });

describe('request id', () => {
  it('genera uno si no llega y lo devuelve en la cabecera', async () => {
    const r = await api.pedir('/naves');
    assert.match(r.cabeceras.get('x-request-id'), /^req-\d{8}$/);
  });

  it('respeta un id valido recibido y lo usa en todos los logs de la peticion', async () => {
    const id = 'traza-externa-001';
    const r = await api.json('/misiones', { naveId: 1, destino: 'Marte', objetivo: 'Mapear el valle' }, 'POST', { 'x-request-id': id });
    assert.equal(r.status, 201);
    assert.equal(r.cabeceras.get('x-request-id'), id);
    const mensajes = api.logsDe(id).map((e) => e.mensaje);
    assert.deepEqual(mensajes, ['mision.creada', 'http.respuesta']);
  });

  it('descarta un id con formato invalido y lo deja registrado', async () => {
    const r = await api.pedir('/naves', { headers: { 'x-request-id': 'corto' } });
    const id = r.cabeceras.get('x-request-id');
    assert.notEqual(id, 'corto');
    const [aviso] = api.logsDe(id);
    assert.equal(aviso.mensaje, 'request_id.descartado');
    assert.equal(aviso.nivel, 'warn');
  });
});

describe('log de accesos', () => {
  it('registra metodo, ruta, patron, status, duracion y bytes', async () => {
    const r = await api.pedir('/naves/2', { headers: { 'user-agent': 'prueba/1.0' } });
    const acceso = api.logsDe(r.cabeceras.get('x-request-id')).at(-1);
    assert.equal(acceso.mensaje, 'http.respuesta');
    assert.equal(acceso.nivel, 'info');
    assert.equal(acceso.metodo, 'GET');
    assert.equal(acceso.ruta, '/avanzado/ejercicio-13/naves/2');
    assert.equal(acceso.patron, '/avanzado/ejercicio-13/naves/:id');
    assert.equal(acceso.status, 200);
    assert.equal(acceso.duracionMs, 5);
    assert.ok(acceso.bytes > 0);
    assert.equal(acceso.agente, 'prueba/1.0');
    assert.equal(acceso.servicio, 'flota-estelar');
  });

  it('usa warn para 4xx y redacta parametros sensibles de la url', async () => {
    const r = await api.pedir('/naves/999?token=secreto123');
    assert.equal(r.status, 404);
    const acceso = api.logsDe(r.cabeceras.get('x-request-id')).at(-1);
    assert.equal(acceso.nivel, 'warn');
    assert.equal(acceso.status, 404);
    assert.equal(acceso.ruta, `/avanzado/ejercicio-13/naves/999?token=${REDACTADO}`);
    assert.equal(JSON.stringify(api.memoria.consultar({ limite: 200 })).includes('secreto123'), false);
  });

  it('no registra accesos a /logs ni /health', async () => {
    const r = await api.pedir('/health');
    assert.equal(r.status, 200);
    assert.equal(r.cuerpo.nivelLog, 'info');
    const l = await api.pedir('/logs');
    assert.equal(api.logsDe(r.cabeceras.get('x-request-id')).length, 0);
    assert.equal(api.logsDe(l.cabeceras.get('x-request-id')).length, 0);
  });
});

describe('consulta de logs', () => {
  it('filtra por requestId y nivel, y entrega estadisticas', async () => {
    const r = await api.pedir('/naves/abc');
    const id = r.cabeceras.get('x-request-id');
    const logs = await api.pedir(`/logs?requestId=${id}&nivel=warn`);
    assert.equal(logs.status, 200);
    assert.equal(logs.cabeceras.get('cache-control'), 'no-store');
    assert.equal(logs.cuerpo.total, 1);
    assert.equal(logs.cuerpo.data[0].status, 400);
    assert.ok(logs.cuerpo.estadisticas.recibidas > 0);
  });

  it('valida los parametros de la consulta', async () => {
    const r = await api.pedir('/logs?nivel=todo&limite=0&requestId=x&extra=1');
    assert.equal(r.status, 400);
    assert.deepEqual(r.cuerpo.errores.map((e) => e.campo).sort(), ['extra', 'limite', 'nivel', 'requestId']);
    const doble = await api.pedir('/logs?nivel=info&nivel=warn');
    assert.equal(doble.status, 400);
  });

  it('cambia el nivel en caliente y deja rastro del cambio', async () => {
    const entorno = await levantarApi();
    try {
      await entorno.json('/naves/1/telemetria', { combustible: 50, temperaturaC: 20, velocidadKms: 7 });
      assert.equal(entorno.memoria.consultar({ mensaje: 'telemetria.recibida' }).total, 0);
      const cambio = await entorno.json('/logs/nivel', { nivel: 'debug' }, 'PUT');
      assert.deepEqual(cambio.cuerpo, { ok: true, anterior: 'info', nivel: 'debug' });
      const t = await entorno.json('/naves/1/telemetria', { combustible: 10, temperaturaC: 20, velocidadKms: 7 });
      assert.equal(t.status, 202);
      assert.deepEqual(t.cuerpo.data.alertas, ['combustible_bajo']);
      const mensajes = entorno.logsDe(t.cabeceras.get('x-request-id')).map((e) => e.mensaje);
      assert.deepEqual(mensajes, ['telemetria.recibida', 'telemetria.combustible_bajo', 'http.respuesta']);
      assert.equal(entorno.memoria.consultar({ mensaje: 'logs.nivel_cambiado' }).total, 1);
      const invalido = await entorno.json('/logs/nivel', { nivel: 'ruido' }, 'PUT');
      assert.equal(invalido.status, 400);
      const borrado = await entorno.pedir('/logs', { method: 'DELETE' });
      assert.ok(borrado.cuerpo.borradas > 0);
    } finally {
      await entorno.cerrar();
    }
  });
});

describe('errores no controlados', () => {
  it('responden 500 generico con requestId y quedan registrados con la pila', async () => {
    const servicios = crearServicios();
    servicios.misiones.listarNaves = () => { throw new Error('sensor de casco averiado'); };
    const entorno = await levantarApi({ servicios });
    try {
      const r = await entorno.pedir('/naves');
      assert.equal(r.status, 500);
      const id = r.cabeceras.get('x-request-id');
      assert.deepEqual(r.cuerpo, {
        ok: false, message: 'Error interno del servidor', codigo: 'ERROR_INTERNO', requestId: id,
      });
      const [error, acceso] = entorno.logsDe(id);
      assert.equal(error.mensaje, 'error.no_controlado');
      assert.equal(error.error.mensaje, 'sensor de casco averiado');
      assert.match(error.error.pila, /sensor de casco averiado/);
      assert.equal(acceso.nivel, 'error');
      assert.equal(acceso.status, 500);
    } finally {
      await entorno.cerrar();
    }
  });
});
