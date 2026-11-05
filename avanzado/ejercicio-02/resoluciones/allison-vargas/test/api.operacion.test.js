import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Router } from 'express';
import { levantarApi, AHORA } from '../soporte/api.js';

describe('endpoints de operacion', () => {
  let api;

  afterEach(() => api.cerrar());

  it('la ruta base describe el ejercicio', async () => {
    api = await levantarApi();
    const { status, cuerpo } = await api.pedir('/');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'arquitectura escalable' });
  });

  it('/salud responde sin consultar a los modulos', async () => {
    api = await levantarApi();
    const { status, cabeceras, cuerpo } = await api.pedir('/salud');
    assert.equal(status, 200);
    assert.equal(cabeceras.get('cache-control'), 'no-store');
    assert.deepEqual(cuerpo, { ok: true, estado: 'vivo', entorno: 'test', iniciadoEn: AHORA.toISOString() });
  });

  it('/listo reporta el estado de cada modulo', async () => {
    api = await levantarApi();
    const { status, cuerpo } = await api.pedir('/listo');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo.modulos, [
      { nombre: 'jugadores', ok: true, detalle: { jugadores: 8 } },
      { nombre: 'partidas', ok: true, detalle: { partidas: 0 } },
      { nombre: 'clasificacion', ok: true, detalle: { jugadoresEnTabla: 8 } },
    ]);
    await api.json('/jugadores', { alias: 'Otro', region: 'NA' });
    const despues = await api.pedir('/listo');
    assert.equal(despues.cuerpo.modulos[0].detalle.jugadores, 9);
    assert.equal(despues.cuerpo.modulos[2].detalle.jugadoresEnTabla, 9);
  });

  it('/listo responde 503 si un modulo no esta sano o si su chequeo falla', async () => {
    const enfermo = { ...moduloFalso('enfermo'), estado: () => ({ ok: false, detalle: { motivo: 'sin conexion' } }) };
    api = await levantarApi({ modulos: [enfermo] });
    const { status, cuerpo } = await api.pedir('/listo');
    assert.equal(status, 503);
    assert.equal(cuerpo.estado, 'no_listo');
    assert.deepEqual(cuerpo.modulos[0], { nombre: 'enfermo', ok: false, detalle: { motivo: 'sin conexion' } });
    await api.cerrar();

    const roto = { ...moduloFalso('roto'), estado: () => { throw new Error('chequeo caido'); } };
    api = await levantarApi({ modulos: [roto] });
    const segundo = await api.pedir('/listo');
    assert.equal(segundo.status, 503);
    assert.equal(segundo.cuerpo.modulos[0].detalle.error, 'chequeo caido');
  });

  it('al apagar, /listo avisa al balanceador y se cierran las conexiones', async () => {
    api = await levantarApi();
    assert.equal((await api.pedir('/')).cabeceras.get('connection'), 'keep-alive');
    api.app.marcarApagando();
    const listo = await api.pedir('/listo');
    assert.deepEqual([listo.status, listo.cuerpo.estado], [503, 'apagando']);
    assert.equal(listo.cabeceras.get('connection'), 'close');
    assert.equal((await api.pedir('/salud')).status, 200);
  });

  it('/modulos documenta dependencias y eventos', async () => {
    api = await levantarApi();
    const { cuerpo } = await api.pedir('/modulos');
    const clasificacion = cuerpo.data.find((m) => m.nombre === 'clasificacion');
    assert.deepEqual(clasificacion, {
      nombre: 'clasificacion',
      ruta: '/avanzado/ejercicio-02/clasificacion',
      dependencias: ['jugadores'],
      emite: [],
      escucha: ['jugador.creado', 'partida.finalizada'],
    });
  });

  it('lo que cada modulo dice escuchar y emitir coincide con el bus', async () => {
    api = await levantarApi();
    const bus = api.contenedor.resolver('eventos');
    for (const modulo of api.app.modulos) {
      for (const evento of modulo.escucha ?? []) assert.ok(bus.cantidad(evento) >= 1, `${modulo.nombre} escucha ${evento}`);
    }
    const emitidos = new Set(api.app.modulos.flatMap((m) => m.emite ?? []));
    const escuchados = new Set(api.app.modulos.flatMap((m) => m.escucha ?? []));
    assert.deepEqual([...emitidos].sort(), [...escuchados].sort());
  });

  it('los metodos no permitidos responden 405 con Allow', async () => {
    api = await levantarApi();
    for (const ruta of ['/', '/salud', '/listo', '/modulos']) {
      const { status, cabeceras } = await api.pedir(ruta, { method: 'POST' });
      assert.deepEqual([status, cabeceras.get('allow')], [405, 'GET'], ruta);
    }
    const opciones = await api.pedir('/salud', { method: 'OPTIONS' });
    assert.deepEqual([opciones.status, opciones.cabeceras.get('allow')], [204, 'GET']);
  });
});

function moduloFalso(nombre) {
  return { nombre, ruta: `/${nombre}`, registrar() {}, crearRouter: () => Router() };
}

describe('identificador de peticion y bitacora', () => {
  let api;

  afterEach(() => api.cerrar());

  it('conserva un X-Request-Id valido y genera otro cuando no sirve', async () => {
    api = await levantarApi();
    const propio = await api.pedir('/salud', { headers: { 'x-request-id': 'cliente-12345678' } });
    assert.equal(propio.cabeceras.get('x-request-id'), 'cliente-12345678');
    const generado = await api.pedir('/salud');
    assert.match(generado.cabeceras.get('x-request-id'), /^[0-9a-f-]{36}$/);
    const invalido = await api.pedir('/salud', { headers: { 'x-request-id': 'corto' } });
    assert.match(invalido.cabeceras.get('x-request-id'), /^[0-9a-f-]{36}$/);
    const inyectado = await api.pedir('/salud', { headers: { 'x-request-id': 'a'.repeat(100) } });
    assert.notEqual(inyectado.cabeceras.get('x-request-id'), 'a'.repeat(100));
  });

  it('los errores incluyen el mismo id que la cabecera', async () => {
    api = await levantarApi();
    const { cabeceras, cuerpo } = await api.pedir('/jugadores/99', { headers: { 'x-request-id': 'traza-abcdef12' } });
    assert.equal(cuerpo.idPeticion, 'traza-abcdef12');
    assert.equal(cabeceras.get('x-request-id'), 'traza-abcdef12');
  });

  it('cada peticion deja una linea de log estructurada sin query', async () => {
    api = await levantarApi();
    await api.pedir('/jugadores?buscar=secreto', { headers: { 'x-request-id': 'log-abcdef123' } });
    await new Promise((resolver) => setTimeout(resolver, 10));
    const linea = api.logs.find((l) => l.msg === 'peticion' && l.idPeticion === 'log-abcdef123');
    assert.ok(linea);
    assert.equal(linea.metodo, 'GET');
    assert.equal(linea.ruta, '/avanzado/ejercicio-02/jugadores');
    assert.equal(linea.status, 200);
    assert.equal(linea.nivel, 'info');
    assert.equal(typeof linea.ms, 'number');
    assert.equal(linea.ts, AHORA.toISOString());
    assert.equal(JSON.stringify(api.logs).includes('secreto'), false);
  });

  it('un error inesperado responde 500 generico y deja el detalle en el log', async () => {
    const explosivo = {
      ...moduloFalso('explosivo'),
      crearRouter() {
        const router = Router();
        router.get('/', () => {
          throw new Error('clave secreta del servidor');
        });
        return router;
      },
    };
    api = await levantarApi({ modulos: [explosivo] });
    const { status, cuerpo } = await api.pedir('/explosivo');
    assert.equal(status, 500);
    assert.equal(cuerpo.codigo, 'ERROR_INTERNO');
    assert.equal(JSON.stringify(cuerpo).includes('secreta'), false);
    const registro = api.logs.find((l) => l.msg === 'error_no_controlado');
    assert.equal(registro.error, 'clave secreta del servidor');
    assert.equal(registro.idPeticion, cuerpo.idPeticion);
  });

  it('las rutas desconocidas responden 404 con el mismo formato', async () => {
    api = await levantarApi();
    for (const ruta of ['/nada', '/jugadores/1/amigos']) {
      const { status, cuerpo } = await api.pedir(ruta);
      assert.equal(status, 404, ruta);
      assert.equal(cuerpo.codigo, 'RUTA_NO_ENCONTRADA');
    }
    const fuera = await fetch(`${api.origen}/otra-cosa`);
    assert.equal(fuera.status, 404);
  });
});

describe('limite de peticiones', () => {
  let api;

  afterEach(() => api.cerrar());

  it('bloquea al pasar el maximo y muestra los encabezados RateLimit', async () => {
    api = await levantarApi({ env: { LIMITE_PETICIONES: '3', LIMITE_VENTANA_MS: '60000' } });
    const restantes = [];
    for (let i = 0; i < 3; i += 1) {
      const { status, cabeceras } = await api.pedir('/jugadores/1');
      assert.equal(status, 200);
      assert.equal(cabeceras.get('ratelimit-limit'), '3');
      restantes.push(cabeceras.get('ratelimit-remaining'));
    }
    assert.deepEqual(restantes, ['2', '1', '0']);
    const bloqueada = await api.pedir('/jugadores/1');
    assert.equal(bloqueada.status, 429);
    assert.equal(bloqueada.cuerpo.codigo, 'LIMITE_EXCEDIDO');
    assert.equal(bloqueada.cabeceras.get('retry-after'), '60');
    assert.equal(bloqueada.cabeceras.get('ratelimit-remaining'), '0');
  });

  it('el reloj reabre la ventana y Retry-After baja con el tiempo', async () => {
    api = await levantarApi({ env: { LIMITE_PETICIONES: '1', LIMITE_VENTANA_MS: '10000' } });
    await api.pedir('/jugadores');
    api.reloj.avanzar(4000);
    const espera = await api.pedir('/jugadores');
    assert.equal(espera.status, 429);
    assert.equal(espera.cabeceras.get('retry-after'), '6');
    api.reloj.avanzar(6000);
    assert.equal((await api.pedir('/jugadores')).status, 200);
  });

  it('la salud y la raiz no gastan cuota', async () => {
    api = await levantarApi({ env: { LIMITE_PETICIONES: '1' } });
    for (let i = 0; i < 5; i += 1) {
      assert.equal((await api.pedir('/salud')).status, 200);
      assert.equal((await api.pedir('/listo')).status, 200);
    }
    assert.equal((await api.pedir('/jugadores')).status, 200);
    assert.equal((await api.pedir('/jugadores')).status, 429);
  });

  it('el almacen se puede reemplazar sin tocar el middleware', async () => {
    const almacenFalso = { golpear: () => ({ conteo: 1000, reinicia: AHORA.getTime() + 5000 }) };
    api = await levantarApi({ sobreescribir: { 'limitador.almacen': almacenFalso } });
    const { status, cabeceras } = await api.pedir('/jugadores');
    assert.equal(status, 429);
    assert.equal(cabeceras.get('retry-after'), '5');
  });

  it('una configuracion invalida impide arrancar', async () => {
    api = { cerrar: async () => {} };
    await assert.rejects(levantarApi({ env: { LIMITE_PETICIONES: 'muchas' } }), /LIMITE_PETICIONES/);
  });
});
