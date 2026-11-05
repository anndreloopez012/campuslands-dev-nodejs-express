import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp, crearServicios } from '../src/app.js';
import { verificarCadena } from '../src/auditoria/cadena.js';
import { levantar } from '../soporte/cliente.js';

const AHORA = new Date('2026-11-05T12:00:00.000Z');
const PERSONAL = {
  mara: '1', iker: '2', luna: '3', teo: '4',
};
const CITA = {
  clienteId: 2, tatuadorId: 3, fecha: '2026-11-20T15:00:00Z', zona: 'antebrazo', precio: 180000, deposito: 40000,
};

async function conApi(prueba, opciones = {}) {
  const servicios = crearServicios({ reloj: () => AHORA, ...opciones });
  const api = await levantar(crearApp({ servicios, registro: () => {} }));
  const cab = (quien, extra = {}) => ({ 'x-usuario-id': PERSONAL[quien], ...extra });
  const herramientas = {
    ...api,
    servicios,
    como: (quien, ruta, metodo = 'GET') => api.pedir(ruta, { method: metodo, headers: cab(quien) }),
    jsonComo: (quien, ruta, cuerpo, metodo = 'POST', extra = {}) => api.json(ruta, cuerpo, metodo, cab(quien, extra)),
    ultimas: (n = 1) => servicios.auditoria.todas().slice(-n),
  };
  try {
    await prueba(herramientas);
  } finally {
    await api.cerrar();
  }
}

describe('registro de cada accion', () => {
  it('crear y editar dejan quien, que, cuando, desde donde y el diff', () => conApi(async (api) => {
    const c = await api.jsonComo('iker', '/citas', CITA, 'POST', { 'x-request-id': 'req-tatuaje-001' });
    assert.equal(c.status, 201);
    const [creacion] = api.ultimas();
    assert.equal(creacion.accion, 'cita.crear');
    assert.deepEqual(creacion.actor, { id: 2, rol: 'recepcion' });
    assert.deepEqual(creacion.recurso, { tipo: 'cita', id: 1 });
    assert.equal(creacion.requestId, 'req-tatuaje-001');
    assert.equal(creacion.momento, '2026-11-05T12:00:00.000Z');
    assert.ok(creacion.ip);
    assert.ok(creacion.cambios.some((x) => x.campo === 'precio' && x.antes === null && x.despues === 180000));

    const e = await api.jsonComo('iker', '/citas/1', { precio: 200000, zona: 'antebrazo' }, 'PATCH');
    assert.equal(e.cuerpo.data.precio, 200000);
    assert.deepEqual(api.ultimas()[0].cambios, [{ campo: 'precio', antes: 180000, despues: 200000 }]);

    const cancelada = await api.jsonComo('mara', '/citas/1/cancelacion', { motivo: 'cliente enfermo' });
    assert.equal(cancelada.cuerpo.data.estado, 'cancelada');
    assert.equal(api.ultimas()[0].motivo, 'cliente enfermo');
    assert.equal((await api.jsonComo('mara', '/citas/2', { precio: 1 }, 'PATCH')).status, 404);
    assert.equal((await api.jsonComo('mara', '/citas/1', { precio: 150000 }, 'PATCH')).cuerpo.codigo, 'ESTADO_INVALIDO');
  }));

  it('el consentimiento cambia cita y cliente en una sola entrada sin exponer alergias', () => conApi(async (api) => {
    await api.jsonComo('iker', '/citas', CITA);
    const sin = await api.como('luna', '/citas/1/realizacion', 'POST');
    assert.equal(sin.cuerpo.codigo, 'SIN_CONSENTIMIENTO');
    const f = await api.jsonComo('luna', '/citas/1/consentimiento', { firmado: true, alergiasDeclaradas: ['Latex', 'niquel'] });
    assert.equal(f.cuerpo.data.estado, 'confirmada');
    const [entrada] = api.ultimas();
    assert.equal(entrada.accion, 'cita.consentimiento');
    const alergias = entrada.cambios.find((x) => x.campo === 'cliente.alergias');
    assert.deepEqual(alergias, {
      campo: 'cliente.alergias', antes: '[PROTEGIDO]', despues: '[PROTEGIDO]', protegido: true,
    });
    assert.ok(entrada.cambios.some((x) => x.campo === 'cita.estado' && x.despues === 'confirmada'));
    assert.equal((await api.como('luna', '/citas/1/realizacion', 'POST')).cuerpo.data.estado, 'realizada');
  }));
});

describe('intentos denegados y lecturas sensibles', () => {
  it('registra intentos sin permiso aunque no cambien nada', () => conApi(async (api) => {
    await api.jsonComo('iker', '/citas', CITA);
    const r = await api.como('teo', '/citas/1/realizacion', 'POST');
    assert.equal(r.status, 403);
    const [denegado] = api.ultimas();
    assert.deepEqual([denegado.accion, denegado.resultado, denegado.actor.id, denegado.motivo], ['cita.realizar', 'denegado', 4, 'rol tatuador']);
    assert.equal((await api.jsonComo('luna', '/citas', CITA)).status, 403);
    assert.equal((await api.como('iker', '/auditoria')).status, 403);
    assert.equal(api.servicios.auditoria.consultar({ resultado: 'denegado' }).data.length, 3);
  }));

  it('leer alergias queda auditado; recepcion no las ve', () => conApi(async (api) => {
    await api.jsonComo('iker', '/citas', CITA);
    const total = api.servicios.auditoria.total;
    const recepcion = await api.como('iker', '/clientes/2');
    assert.equal(recepcion.cuerpo.data.alergias, undefined);
    assert.equal(api.servicios.auditoria.total, total);
    const tatuadora = await api.como('luna', '/clientes/2');
    assert.deepEqual(tatuadora.cuerpo.data.alergias, ['latex']);
    assert.equal(api.ultimas()[0].accion, 'cliente.ver_sensible');
    assert.equal((await api.como('teo', '/clientes/2')).status, 403);
    assert.equal((await api.como('mara', '/clientes/9')).cuerpo.codigo, 'CLIENTE_NO_ENCONTRADO');
  }));
});

describe('consulta, verificacion y exportacion', () => {
  it('el admin filtra, ve el historial de una cita, verifica y exporta', () => conApi(async (api) => {
    await api.jsonComo('iker', '/citas', CITA);
    await api.jsonComo('iker', '/citas', { ...CITA, clienteId: 1, tatuadorId: 4 });
    await api.jsonComo('iker', '/citas/1', { zona: 'hombro' }, 'PATCH');
    await api.como('teo', '/citas/1/realizacion', 'POST');

    const historial = await api.como('mara', '/citas/1/historial');
    assert.deepEqual(historial.cuerpo.data.map((e) => `${e.accion}:${e.resultado}`), ['cita.crear:exito', 'cita.editar:exito', 'cita.realizar:denegado']);
    const filtrada = await api.como('mara', '/auditoria?actorId=2&accion=cita.crear');
    assert.equal(filtrada.cuerpo.data.length, 2);
    assert.equal(filtrada.cabeceras.get('cache-control'), 'no-store');
    const paginada = await api.como('mara', '/auditoria?limite=2');
    assert.equal(paginada.cuerpo.siguiente, 2);
    const malo = await api.como('mara', '/auditoria?limite=0&resultado=x&desde=ayer&otro=1');
    assert.equal(malo.cuerpo.errores.length, 4);

    const v = await api.como('mara', '/auditoria/verificacion');
    assert.equal(v.cuerpo.data.integro, true);
    assert.equal(v.cuerpo.data.total, 4);
    const exportada = await api.como('mara', '/auditoria/exportacion');
    assert.match(exportada.cabeceras.get('content-type'), /application\/x-ndjson/);
    const lineas = exportada.cuerpo.trim().split('\n').map((l) => JSON.parse(l));
    assert.equal(lineas.length, 4);
    assert.equal(verificarCadena(lineas).integro, true);
  }));
});

describe('atomicidad', () => {
  it('si la auditoria falla la accion no se aplica', () => {
    let caida = true;
    return conApi(async (api) => {
      const r = await api.jsonComo('iker', '/citas', CITA);
      assert.equal(r.status, 503);
      assert.equal(r.cuerpo.codigo, 'AUDITORIA_NO_DISPONIBLE');
      assert.equal((await api.como('iker', '/citas')).cuerpo.data.length, 0);
      caida = false;
      const ok = await api.jsonComo('iker', '/citas', CITA);
      assert.equal(ok.cuerpo.data.id, 1);
      caida = true;
      const edicion = await api.jsonComo('iker', '/citas/1', { precio: 999999 }, 'PATCH');
      assert.equal(edicion.status, 503);
      caida = false;
      assert.equal((await api.como('iker', '/citas')).cuerpo.data[0].precio, 180000);
    }, { alEscribir: () => { if (caida) throw new Error('sin conexion'); } });
  });

  it('valida identidad y datos', () => conApi(async (api) => {
    assert.equal((await api.pedir('/citas')).status, 401);
    assert.equal((await api.pedir('/citas', { headers: { 'x-usuario-id': '77' } })).status, 401);
    const v = await api.jsonComo('iker', '/citas', { ...CITA, fecha: '2026-01-01T00:00:00Z', deposito: 999999, tatuadorId: 2 });
    assert.deepEqual(v.cuerpo.errores.map((e) => e.campo), ['fecha', 'deposito']);
    const t = await api.jsonComo('iker', '/citas', { ...CITA, tatuadorId: 2 });
    assert.equal(t.cuerpo.errores[0].campo, 'tatuadorId');
    const c = await api.jsonComo('luna', '/citas/1/consentimiento', { firmado: false, alergiasDeclaradas: 'no' });
    assert.equal(c.status, 404);
    assert.equal((await api.pedir('/')).cuerpo.topic, 'auditoria de acciones');
  }));
});
