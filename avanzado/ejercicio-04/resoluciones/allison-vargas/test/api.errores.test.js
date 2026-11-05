import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { crearServicios } from '../src/services/index.js';
import { levantar } from '../soporte/cliente.js';
import { levantarApi } from '../soporte/api.js';

describe('catalogo publico de errores', () => {
  let api;
  before(async () => { api = await levantarApi(); });
  after(() => api.cerrar());

  it('lista todos los codigos con su estado', async () => {
    const { status, cuerpo } = await api.pedir('/errores');
    assert.equal(status, 200);
    assert.equal(cuerpo.total, cuerpo.data.length);
    const llena = cuerpo.data.find((e) => e.codigo === 'PARTIDA_LLENA');
    assert.equal(llena.status, 409);
    assert.equal(llena.origen, 'dominio');
    assert.equal(cuerpo.data.find((e) => e.codigo === 'ERROR_INTERNO').status, 500);
  });

  it('filtra por categoria, origen y texto', async () => {
    const reglas = await api.pedir('/errores?categoria=regla_de_negocio');
    assert.ok(reglas.cuerpo.data.length > 5);
    assert.ok(reglas.cuerpo.data.every((e) => e.status === 422));
    const http = await api.pedir('/errores?origen=http');
    assert.ok(http.cuerpo.data.every((e) => e.categoria === 'http'));
    const texto = await api.pedir('/errores?buscar=zona');
    assert.deepEqual(texto.cuerpo.data.map((e) => e.codigo), ['ZONA_FINAL']);
    const mala = await api.pedir('/errores?categoria=otra');
    assert.equal(mala.status, 400);
  });

  it('el type de un problema se puede consultar como recurso', async () => {
    const problema = await api.pedir('/jugadores/999');
    const url = problema.cuerpo.type.replace('/avanzado/ejercicio-04', '');
    const { status, cuerpo } = await api.pedir(url);
    assert.equal(status, 200);
    assert.equal(cuerpo.data.codigo, 'JUGADOR_NO_ENCONTRADO');
    assert.ok(cuerpo.data.sugerencia);
  });

  it('un codigo desconocido responde 404', async () => {
    const { status, cuerpo } = await api.pedir('/errores/NO_EXISTE');
    assert.equal(status, 404);
    assert.equal(cuerpo.codigo, 'CODIGO_DESCONOCIDO');
  });
});

describe('errores del borde http', () => {
  let api;
  before(async () => { api = await levantarApi(); });
  after(() => api.cerrar());

  it('una ruta inexistente responde problema 404', async () => {
    const { status, cuerpo } = await api.pedir('/nada');
    assert.equal(status, 404);
    assert.equal(cuerpo.codigo, 'RUTA_NO_ENCONTRADA');
    assert.equal(cuerpo.categoria, 'http');
  });

  it('un JSON mal formado responde 400 sin filtrar el detalle del parser', async () => {
    const { status, cuerpo } = await api.pedir('/jugadores', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"nick": ',
    });
    assert.equal(status, 400);
    assert.equal(cuerpo.codigo, 'JSON_INVALIDO');
    assert.doesNotMatch(JSON.stringify(cuerpo), /Unexpected|position/);
  });

  it('un body demasiado grande responde 413', async () => {
    const { status, cuerpo } = await api.json('/jugadores', { nick: 'x'.repeat(20000) });
    assert.equal(status, 413);
    assert.equal(cuerpo.codigo, 'PAYLOAD_GRANDE');
  });

  it('devuelve el X-Request-Id recibido o genera uno nuevo', async () => {
    const propio = await api.pedir('/jugadores/999', { headers: { 'x-request-id': 'cliente-1234' } });
    assert.equal(propio.cabeceras.get('x-request-id'), 'cliente-1234');
    assert.equal(propio.cuerpo.idPeticion, 'cliente-1234');
    const invalido = await api.pedir('/jugadores/999', { headers: { 'x-request-id': 'no valido!' } });
    assert.notEqual(invalido.cuerpo.idPeticion, 'no valido!');
    assert.match(invalido.cuerpo.idPeticion, /^[0-9a-f-]{36}$/);
    const exito = await api.pedir('/jugadores/1');
    assert.ok(exito.cabeceras.get('x-request-id'));
  });

  it('no anuncia la tecnologia del servidor', async () => {
    const { cabeceras } = await api.pedir('/');
    assert.equal(cabeceras.get('x-powered-by'), null);
  });
});

describe('errores inesperados', () => {
  it('responden 500 generico, se registran y no filtran el detalle', async () => {
    const registros = [];
    const servicios = crearServicios();
    servicios.jugadores.listar = () => {
      throw new Error('clave de la base: 1234');
    };
    const api = await levantar(crearApp({ servicios, registro: (entrada) => registros.push(entrada) }));
    try {
      const { status, cuerpo } = await api.pedir('/jugadores');
      assert.equal(status, 500);
      assert.equal(cuerpo.codigo, 'ERROR_INTERNO');
      assert.equal(cuerpo.reintentable, true);
      assert.doesNotMatch(JSON.stringify(cuerpo), /clave/);
      assert.equal(registros.length, 1);
      assert.equal(registros[0].nivel, 'error');
      assert.match(registros[0].mensaje, /clave/);
      assert.match(registros[0].pila, /Error: clave/);
      assert.equal(registros[0].idPeticion, cuerpo.idPeticion);
    } finally {
      await api.cerrar();
    }
  });

  it('los errores de dominio no se registran como fallos del servidor', async () => {
    const registros = [];
    const api = await levantar(crearApp({ registro: (entrada) => registros.push(entrada) }));
    try {
      await api.pedir('/jugadores/999');
      await api.pedir('/nada');
      assert.deepEqual(registros, []);
    } finally {
      await api.cerrar();
    }
  });
});
