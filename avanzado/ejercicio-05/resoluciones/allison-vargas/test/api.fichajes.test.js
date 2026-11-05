import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/api.js';

describe('API de fichajes', () => {
  let api;
  beforeEach(async () => { api = await levantarApi(); });
  afterEach(() => api.cerrar());

  const fichar = (cuerpo, clave) => api.pedir('/fichajes', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(clave ? { 'idempotency-key': clave } : {}) },
    body: JSON.stringify(cuerpo),
  });

  it('crea un fichaje y deja los demas recursos consistentes', async () => {
    const { status, cuerpo, cabeceras } = await fichar({ jugadorId: 21, clubDestinoId: 1, precio: 9000 });
    assert.equal(status, 201);
    assert.equal(cuerpo.repetida, false);
    assert.equal(cuerpo.data.comision, 450);
    assert.equal(cabeceras.get('location'), `/avanzado/ejercicio-05/fichajes/${cuerpo.data.id}`);
    assert.equal((await api.pedir('/jugadores/21')).cuerpo.data.clubId, 1);
    assert.equal((await api.pedir('/clubes/1')).cuerpo.data.presupuesto, 110550);
    assert.equal((await api.pedir('/auditoria')).cuerpo.data.consistente, true);
    const detalle = await api.pedir(`/fichajes/${cuerpo.data.id}`);
    assert.equal(detalle.cuerpo.data.destinoId, 1);
  });

  it('repetir con la misma Idempotency-Key responde 200 con la marca de repeticion', async () => {
    const primera = await fichar({ jugadorId: 21, clubDestinoId: 1, precio: 9000 }, 'clave-http-1');
    const segunda = await fichar({ jugadorId: 21, clubDestinoId: 1, precio: 9000 }, 'clave-http-1');
    assert.equal(primera.status, 201);
    assert.equal(segunda.status, 200);
    assert.equal(segunda.cabeceras.get('idempotent-replay'), 'true');
    assert.equal(segunda.cuerpo.repetida, true);
    assert.equal(segunda.cuerpo.data.id, primera.cuerpo.data.id);
    assert.equal((await api.pedir('/fichajes')).cuerpo.paginacion.total, 1);
  });

  it('la misma clave con otro cuerpo es un 422', async () => {
    await fichar({ jugadorId: 21, clubDestinoId: 1, precio: 9000 }, 'clave-http-2');
    const { status, cuerpo } = await fichar({ jugadorId: 22, clubDestinoId: 1, precio: 9000 }, 'clave-http-2');
    assert.equal(status, 422);
    assert.equal(cuerpo.codigo, 'IDEMPOTENCIA_CONFLICTO');
  });

  it('valida el formato de la clave', async () => {
    const { status, cuerpo } = await fichar({ jugadorId: 21, clubDestinoId: 1, precio: 9000 }, 'corta');
    assert.equal(status, 400);
    assert.equal(cuerpo.errores[0].campo, 'Idempotency-Key');
  });

  it('cada regla de negocio llega como un error con su estado', async () => {
    const casos = [
      [{ jugadorId: 21, clubDestinoId: 5, precio: 9000 }, 422, 'MODALIDAD_DISTINTA'],
      [{ jugadorId: 22, clubDestinoId: 4, precio: 8500 }, 409, 'PLANTILLA_COMPLETA'],
      [{ jugadorId: 1, clubDestinoId: 2, precio: 5000 }, 409, 'JUGADOR_RECIEN_FICHADO'],
      [{ jugadorId: 999, clubDestinoId: 2, precio: 5000 }, 404, 'JUGADOR_NO_ENCONTRADO'],
      [{ jugadorId: 21, clubDestinoId: 4, precio: 14500 }, 422, 'PRESUPUESTO_INSUFICIENTE'],
    ];
    for (const [cuerpo, estado, codigo] of casos) {
      const respuesta = await fichar(cuerpo);
      assert.equal(respuesta.status, estado, codigo);
      assert.equal(respuesta.cuerpo.codigo, codigo);
    }
    assert.equal((await api.pedir('/auditoria')).cuerpo.data.consistente, true);
    assert.equal((await api.pedir('/fichajes')).cuerpo.paginacion.total, 0);
  });

  it('un fallo simulado responde 503 y no cambia nada', async () => {
    const antes = (await api.pedir('/clubes')).cuerpo.data;
    const { status, cuerpo } = await fichar({ jugadorId: 21, clubDestinoId: 1, precio: 9000, simularFalloEn: 'movido' });
    assert.equal(status, 503);
    assert.equal(cuerpo.codigo, 'FALLO_SIMULADO');
    assert.deepEqual((await api.pedir('/clubes')).cuerpo.data, antes);
    const diario = await api.pedir('/transacciones?estado=revertida');
    assert.equal(diario.cuerpo.total, 1);
    assert.equal(diario.cuerpo.data[0].error, 'FALLO_SIMULADO');
  });

  it('valida el cuerpo y reune todos los errores', async () => {
    const { status, cuerpo } = await fichar({ jugadorId: 'a', precio: -5, extra: 1, simularFalloEn: 'nunca' });
    assert.equal(status, 400);
    assert.deepEqual(cuerpo.errores.map((e) => e.campo), ['extra', 'jugadorId', 'clubDestinoId', 'precio', 'simularFalloEn']);
  });

  it('el diario cuenta lo que paso y el libro lo respalda', async () => {
    const { cuerpo } = await fichar({ jugadorId: 21, clubDestinoId: 1, precio: 9000 });
    const diario = await api.pedir('/transacciones?nombre=fichar');
    assert.equal(diario.cuerpo.data[0].estado, 'confirmada');
    assert.equal(diario.cuerpo.data[0].escrituras.filter((e) => e.coleccion === 'movimientos').length, 4);
    const libro = await api.pedir(`/movimientos?fichajeId=${cuerpo.data.id}`);
    assert.equal(libro.cuerpo.paginacion.total, 4);
    const delClub = await api.pedir('/movimientos?clubId=2');
    assert.deepEqual(delClub.cuerpo.data.map((m) => m.monto), [9000]);
    const delAgente = await api.pedir('/movimientos?agenteId=1');
    assert.equal(delAgente.cuerpo.data[0].tipo, 'comision_cobrada');
    const avisos = await api.pedir('/notificaciones');
    assert.equal(avisos.cuerpo.data[0].tipo, 'fichaje.confirmado');
  });

  it('filtra fichajes por club y tipo', async () => {
    await fichar({ jugadorId: 21, clubDestinoId: 1, precio: 9000 });
    await api.json('/intercambios', { jugadorAId: 2, jugadorBId: 41 });
    assert.equal((await api.pedir('/fichajes?tipo=intercambio')).cuerpo.paginacion.total, 1);
    assert.equal((await api.pedir('/fichajes?clubId=1')).cuerpo.paginacion.total, 2);
    assert.equal((await api.pedir('/fichajes?clubId=4')).cuerpo.paginacion.total, 0);
    assert.equal((await api.pedir('/fichajes/99')).cuerpo.codigo, 'FICHAJE_NO_ENCONTRADO');
  });

  it('valida el formato del cuerpo', async () => {
    const sinTipo = await api.pedir('/fichajes', { method: 'POST', body: '{}' });
    assert.equal(sinTipo.status, 415);
    const roto = await api.pedir('/fichajes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"a":' });
    assert.equal(roto.cuerpo.codigo, 'JSON_INVALIDO');
    const lista = await api.json('/fichajes', [1]);
    assert.deepEqual(lista.cuerpo.errores, [{ campo: 'cuerpo', mensaje: 'debe ser un objeto' }]);
  });
});

describe('API de simulacion e intercambios', () => {
  let api;
  beforeEach(async () => { api = await levantarApi(); });
  afterEach(() => api.cerrar());

  it('simular un fichaje devuelve los cambios y no modifica nada', async () => {
    const { status, cuerpo } = await api.json('/fichajes/simulacion', { jugadorId: 21, clubDestinoId: 1, precio: 9000 });
    assert.equal(status, 200);
    assert.equal(cuerpo.data.viable, true);
    assert.ok(cuerpo.data.cambios.some((c) => c.coleccion === 'jugadores' && c.despues.clubId === 1));
    assert.equal((await api.pedir('/jugadores/21')).cuerpo.data.clubId, 2);
    assert.equal((await api.pedir('/fichajes')).cuerpo.paginacion.total, 0);
    const diario = await api.pedir('/transacciones?estado=simulada');
    assert.equal(diario.cuerpo.total, 1);
  });

  it('simular algo inviable responde 200 con la razon', async () => {
    const { status, cuerpo } = await api.json('/fichajes/simulacion', { jugadorId: 21, clubDestinoId: 5, precio: 9000 });
    assert.equal(status, 200);
    assert.equal(cuerpo.data.viable, false);
    assert.equal(cuerpo.data.error.codigo, 'MODALIDAD_DISTINTA');
  });

  it('crea un intercambio con compensacion', async () => {
    const { status, cuerpo } = await api.json('/intercambios', {
      jugadorAId: 2,
      jugadorBId: 22,
      compensacion: { pagaClubId: 1, monto: 3000 },
    });
    assert.equal(status, 201);
    assert.equal(cuerpo.data.tipo, 'intercambio');
    assert.equal(cuerpo.data.precio, 3000);
    assert.equal((await api.pedir('/clubes/2')).cuerpo.data.presupuesto, 93000);
  });

  it('valida el intercambio', async () => {
    const igual = await api.json('/intercambios', { jugadorAId: 2, jugadorBId: 2 });
    assert.deepEqual(igual.cuerpo.errores, [{ campo: 'jugadorBId', mensaje: 'debe ser distinto de jugadorAId' }]);
    const compensacion = await api.json('/intercambios', { jugadorAId: 2, jugadorBId: 22, compensacion: { monto: 0, otro: 1 } });
    assert.deepEqual(compensacion.cuerpo.errores.map((e) => e.campo), ['compensacion.otro', 'compensacion.pagaClubId', 'compensacion.monto']);
    const tipo = await api.json('/intercambios', { jugadorAId: 2, jugadorBId: 22, compensacion: 5 });
    assert.equal(tipo.cuerpo.errores[0].campo, 'compensacion');
  });

  it('un intercambio con fallo simulado no deja medio intercambio', async () => {
    const { status } = await api.json('/intercambios', { jugadorAId: 2, jugadorBId: 22, simularFalloEn: 'movidoB' });
    assert.equal(status, 503);
    assert.equal((await api.pedir('/jugadores/2')).cuerpo.data.clubId, 1);
    assert.equal((await api.pedir('/jugadores/22')).cuerpo.data.clubId, 2);
  });

  it('informa los metodos de las rutas de escritura', async () => {
    const { status, cabeceras } = await api.pedir('/intercambios');
    assert.equal(status, 405);
    assert.equal(cabeceras.get('allow'), 'POST');
  });
});

describe('API con la simulacion de fallos deshabilitada', () => {
  it('rechaza el campo simularFalloEn', async () => {
    const api = await levantarApi({ permitirFallos: false });
    try {
      const { status, cuerpo } = await api.json('/fichajes', { jugadorId: 21, clubDestinoId: 1, precio: 9000, simularFalloEn: 'movido' });
      assert.equal(status, 400);
      assert.equal(cuerpo.errores[0].campo, 'simularFalloEn');
    } finally {
      await api.cerrar();
    }
  });
});

describe('API ante errores inesperados', () => {
  it('responde 500 generico, registra el detalle y no cambia nada', async () => {
    const registros = [];
    const api = await levantarApi({ registro: (entrada) => registros.push(entrada) });
    try {
      const original = api.almacen.leerRegistro.bind(api.almacen);
      api.almacen.leerRegistro = (coleccion, id) => {
        if (coleccion === 'agentes') throw new Error('disco danado: 0xDEAD');
        return original(coleccion, id);
      };
      const { status, cuerpo } = await api.json('/fichajes', { jugadorId: 21, clubDestinoId: 1, precio: 9000 });
      assert.equal(status, 500);
      assert.deepEqual(cuerpo, { ok: false, message: 'Error interno del servidor', codigo: 'ERROR_INTERNO' });
      assert.equal(registros.length, 1);
      assert.match(registros[0].mensaje, /disco danado/);
      api.almacen.leerRegistro = original;
      assert.equal((await api.pedir('/jugadores/21')).cuerpo.data.clubId, 2);
      assert.equal((await api.pedir('/clubes/1')).cuerpo.data.presupuesto, 120000);
    } finally {
      await api.cerrar();
    }
  });

  it('una ruta inexistente responde 404 y un body enorme 413', async () => {
    const api = await levantarApi();
    try {
      const falta = await api.pedir('/nada');
      assert.equal(falta.status, 404);
      assert.equal(falta.cuerpo.codigo, 'RUTA_NO_ENCONTRADA');
      const grande = await api.json('/fichajes', { jugadorId: 'x'.repeat(20000) });
      assert.equal(grande.status, 413);
    } finally {
      await api.cerrar();
    }
  });
});
