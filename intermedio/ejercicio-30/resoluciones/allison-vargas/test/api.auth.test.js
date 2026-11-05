import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarTaller, CREDENCIALES, AHORA } from '../soporte/taller.js';

describe('autenticacion y roles', () => {
  let taller;

  beforeEach(async () => {
    taller = await levantarTaller();
  });

  afterEach(() => taller.cerrar());

  it('la ruta principal es publica', async () => {
    const { status, cuerpo } = await taller.cliente.pedir('');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'proyecto integrador intermedio' });
  });

  it('inicia sesion y devuelve token, vencimiento y usuario sin datos sensibles', async () => {
    const { status, cuerpo } = await taller.cliente.json('/auth/login', CREDENCIALES.lucia);
    assert.equal(status, 200);
    assert.equal(cuerpo.data.tipo, 'Bearer');
    assert.equal(cuerpo.data.expira, new Date(AHORA.getTime() + 3600 * 1000).toISOString());
    assert.deepEqual(cuerpo.data.usuario, { id: 2, usuario: 'lucia', nombre: 'Lucia Morales', rol: 'recepcion' });
    assert.equal(JSON.stringify(cuerpo).includes('passwordHash'), false);
  });

  it('rechaza credenciales incorrectas con el mismo mensaje', async () => {
    const casos = [
      { usuario: 'lucia', password: 'mala' },
      { usuario: 'nadie', password: 'Recepcion2026' },
      CREDENCIALES.pedro,
    ];
    for (const cuerpo of casos) {
      const respuesta = await taller.cliente.json('/auth/login', cuerpo);
      assert.equal(respuesta.status, 401);
      assert.equal(respuesta.cuerpo.codigo, 'CREDENCIALES_INVALIDAS');
      assert.equal(respuesta.cuerpo.message, 'Usuario o password incorrectos');
      assert.equal(respuesta.cabeceras.get('www-authenticate'), 'Bearer');
    }
  });

  it('valida el cuerpo del login y exige JSON', async () => {
    for (const cuerpo of [{}, { usuario: 'lucia' }, { usuario: 'lu', password: 'x' }, { usuario: 'lucia', password: 'x', extra: 1 }]) {
      assert.equal((await taller.cliente.json('/auth/login', cuerpo)).status, 400, JSON.stringify(cuerpo));
    }
    const texto = await taller.cliente.pedir('/auth/login', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' });
    assert.equal(texto.status, 415);
    assert.equal((await taller.cliente.pedir('/auth/login')).status, 405);
  });

  it('GET /auth/yo devuelve el usuario del token', async () => {
    const carlos = await taller.como('carlos');
    const { status, cuerpo } = await carlos.get('/auth/yo');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo.data, { id: 3, usuario: 'carlos', nombre: 'Carlos Perez', rol: 'mecanico' });
  });

  it('exige token en las rutas protegidas', async () => {
    for (const ruta of ['/clientes', '/motos', '/repuestos', '/ordenes', '/mecanicos', '/reportes/resumen', '/auth/yo']) {
      const { status, cuerpo } = await taller.anonimo.get(ruta);
      assert.equal(status, 401, ruta);
      assert.equal(cuerpo.codigo, 'NO_AUTENTICADO');
    }
  });

  it('rechaza esquemas distintos de Bearer y tokens falsos', async () => {
    const basico = await taller.cliente.pedir('/clientes', { headers: { authorization: 'Basic abc' } });
    assert.equal(basico.status, 401);
    const falso = await taller.con('abc.def').get('/clientes');
    assert.equal(falso.status, 401);
    assert.equal(falso.cuerpo.codigo, 'TOKEN_INVALIDO');
  });

  it('un token vencido deja de funcionar', async () => {
    let ahora = AHORA;
    const otro = await levantarTaller({ reloj: () => ahora });
    const { cuerpo } = await otro.cliente.json('/auth/login', CREDENCIALES.admin);
    const sesion = otro.con(cuerpo.data.token);
    assert.equal((await sesion.get('/clientes')).status, 200);
    ahora = new Date(AHORA.getTime() + 3601 * 1000);
    const vencido = await sesion.get('/clientes');
    assert.equal(vencido.status, 401);
    assert.equal(vencido.cuerpo.codigo, 'TOKEN_INVALIDO');
    await otro.cerrar();
  });

  it('cada rol solo entra a lo que le corresponde', async () => {
    const lucia = await taller.como('lucia');
    const carlos = await taller.como('carlos');
    assert.equal((await lucia.get('/reportes/resumen')).status, 403);
    assert.equal((await carlos.get('/reportes/resumen')).status, 403);
    assert.equal((await carlos.post('/clientes', { nombre: 'Nuevo Cliente', telefono: '55500000' })).status, 403);
    assert.equal((await lucia.post('/repuestos', { codigo: 'XYZ-1', nombre: 'Repuesto nuevo', precio: 5, stock: 1 })).status, 403);
    const prohibido = await carlos.post('/ordenes', { motoId: 3, descripcion: 'Revision general' });
    assert.equal(prohibido.status, 403);
    assert.equal(prohibido.cuerpo.codigo, 'PERMISOS_INSUFICIENTES');
  });
});
