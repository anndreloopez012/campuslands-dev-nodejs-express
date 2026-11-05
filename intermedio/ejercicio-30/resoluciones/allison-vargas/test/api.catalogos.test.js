import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarTaller } from '../soporte/taller.js';

describe('clientes, motos y repuestos', () => {
  let taller;
  let lucia;
  let admin;
  let carlos;

  beforeEach(async () => {
    taller = await levantarTaller();
    lucia = await taller.como('lucia');
    admin = await taller.como('admin');
    carlos = await taller.como('carlos');
  });

  afterEach(() => taller.cerrar());

  describe('clientes', () => {
    it('lista, busca y ordena', async () => {
      const todos = await carlos.get('/clientes');
      assert.equal(todos.cabeceras.get('x-total-count'), '3');
      const busqueda = await carlos.get('/clientes?buscar=GIRON');
      assert.deepEqual(busqueda.cuerpo.data.map((c) => c.id), [2]);
      const orden = await carlos.get('/clientes?orden=nombre');
      assert.deepEqual(orden.cuerpo.data.map((c) => c.nombre), ['Ana Giron', 'Jorge Castillo', 'Luis Herrera']);
    });

    it('rechaza consultas invalidas', async () => {
      for (const consulta of ['buscar=', 'orden=edad', 'limite=0', 'x=1']) {
        assert.equal((await carlos.get(`/clientes?${consulta}`)).status, 400, consulta);
      }
    });

    it('obtiene un cliente y responde 404 o 400', async () => {
      assert.equal((await carlos.get('/clientes/1')).cuerpo.data.nombre, 'Jorge Castillo');
      assert.equal((await carlos.get('/clientes/99')).cuerpo.codigo, 'CLIENTE_NO_ENCONTRADO');
      assert.equal((await carlos.get('/clientes/uno')).status, 400);
    });

    it('crea un cliente con 201, Location y email opcional', async () => {
      const { status, cabeceras, cuerpo } = await lucia.post('/clientes', { nombre: 'Maria Soto', telefono: '55511111', email: 'MARIA@correo.com' });
      assert.equal(status, 201);
      assert.equal(cabeceras.get('location'), '/intermedio/ejercicio-30/clientes/4');
      assert.deepEqual(cuerpo.data, { id: 4, nombre: 'Maria Soto', telefono: '55511111', email: 'maria@correo.com' });
      const sinEmail = await admin.post('/clientes', { nombre: 'Pablo Diaz', telefono: '55522222' });
      assert.equal(sinEmail.status, 201);
      assert.equal('email' in sinEmail.cuerpo.data, false);
    });

    it('valida el cuerpo y no repite telefonos', async () => {
      for (const cuerpo of [{}, { nombre: 'Maria Soto', telefono: '1234' }, { nombre: 'Maria Soto', telefono: 'abcdefgh' }, { nombre: 'Maria Soto', telefono: '55511111', email: 'no-es-email' }, { nombre: 'Ma', telefono: '55511111' }]) {
        assert.equal((await lucia.post('/clientes', cuerpo)).status, 400, JSON.stringify(cuerpo));
      }
      const repetido = await lucia.post('/clientes', { nombre: 'Otro Nombre', telefono: '55501234' });
      assert.equal(repetido.status, 409);
      assert.equal(repetido.cuerpo.codigo, 'TELEFONO_DUPLICADO');
    });

    it('actualiza parcialmente', async () => {
      const { status, cuerpo } = await lucia.patch('/clientes/2', { telefono: '55599999' });
      assert.equal(status, 200);
      assert.equal(cuerpo.data.telefono, '55599999');
      assert.equal(cuerpo.data.nombre, 'Ana Giron');
      assert.equal((await lucia.patch('/clientes/2', { telefono: '55501234' })).cuerpo.codigo, 'TELEFONO_DUPLICADO');
      assert.equal((await lucia.patch('/clientes/2', { telefono: '55599999' })).status, 200);
      assert.equal((await lucia.patch('/clientes/2', {})).status, 400);
      assert.equal((await lucia.patch('/clientes/77', { nombre: 'Nadie Aqui' })).status, 404);
    });

    it('responde 405 con Allow y 415 sin JSON', async () => {
      const metodo = await carlos.del('/clientes/1');
      assert.equal(metodo.status, 405);
      assert.equal(metodo.cabeceras.get('allow'), 'GET, PATCH');
      const tipo = await taller.cliente.pedir('/clientes', { method: 'POST', headers: { authorization: `Bearer ${lucia.token}`, 'content-type': 'text/plain' }, body: 'x' });
      assert.equal(tipo.status, 415);
    });
  });

  describe('motos', () => {
    const nueva = { clienteId: 3, placa: 'm555xyz', marca: 'Honda', modelo: 'XR150', cilindraje: 149, anio: 2024 };

    it('lista y filtra por cliente y por texto', async () => {
      assert.equal((await carlos.get('/motos')).cabeceras.get('x-total-count'), '4');
      assert.deepEqual((await carlos.get('/motos?clienteId=1')).cuerpo.data.map((m) => m.id), [1, 2]);
      assert.deepEqual((await carlos.get('/motos?buscar=pulsar')).cuerpo.data.map((m) => m.id), [4]);
      assert.deepEqual((await carlos.get('/motos?buscar=M789')).cuerpo.data.map((m) => m.id), [3]);
      assert.deepEqual((await carlos.get('/motos?orden=anio')).cuerpo.data.map((m) => m.anio), [2023, 2022, 2021, 2020]);
    });

    it('rechaza filtros invalidos y ids invalidos', async () => {
      for (const consulta of ['clienteId=x', 'buscar=', 'orden=marca']) {
        assert.equal((await carlos.get(`/motos?${consulta}`)).status, 400, consulta);
      }
      assert.equal((await carlos.get('/motos/99')).cuerpo.codigo, 'MOTO_NO_ENCONTRADA');
      assert.equal((await carlos.get('/motos/0')).status, 400);
    });

    it('registra una moto guardando la placa en mayusculas', async () => {
      const { status, cabeceras, cuerpo } = await lucia.post('/motos', nueva);
      assert.equal(status, 201);
      assert.equal(cabeceras.get('location'), '/intermedio/ejercicio-30/motos/5');
      assert.equal(cuerpo.data.placa, 'M555XYZ');
    });

    it('valida el cuerpo, el cliente y la placa unica', async () => {
      for (const cambio of [{ placa: 'ab' }, { placa: 'M12 345' }, { cilindraje: 10 }, { anio: 1950 }, { marca: 'H' }, { clienteId: 'x' }, { extra: 1 }]) {
        assert.equal((await lucia.post('/motos', { ...nueva, ...cambio })).status, 400, JSON.stringify(cambio));
      }
      const sinCliente = await lucia.post('/motos', { ...nueva, clienteId: 99 });
      assert.equal(sinCliente.status, 422);
      assert.equal(sinCliente.cuerpo.codigo, 'REFERENCIA_INVALIDA');
      const repetida = await lucia.post('/motos', { ...nueva, placa: 'm123abc' });
      assert.equal(repetida.status, 409);
      assert.equal(repetida.cuerpo.codigo, 'PLACA_DUPLICADA');
    });

    it('actualiza datos pero no la placa', async () => {
      const ok = await lucia.patch('/motos/1', { clienteId: 2, anio: 2023 });
      assert.equal(ok.status, 200);
      assert.deepEqual([ok.cuerpo.data.clienteId, ok.cuerpo.data.anio, ok.cuerpo.data.placa], [2, 2023, 'M123ABC']);
      assert.equal((await lucia.patch('/motos/1', { placa: 'M000AAA' })).status, 400);
      assert.equal((await lucia.patch('/motos/1', { clienteId: 99 })).status, 422);
      assert.equal((await lucia.patch('/motos/99', { anio: 2020 })).status, 404);
    });
  });

  describe('repuestos', () => {
    it('lista con filtros de disponibilidad, busqueda y orden', async () => {
      assert.deepEqual((await carlos.get('/repuestos?disponible=false')).cuerpo.data.map((r) => r.codigo), ['LLA-90-R17']);
      assert.equal((await carlos.get('/repuestos?disponible=true')).cabeceras.get('x-total-count'), '5');
      assert.deepEqual((await carlos.get('/repuestos?buscar=filtro')).cuerpo.data.map((r) => r.id), [2]);
      assert.deepEqual((await carlos.get('/repuestos?buscar=ace-10')).cuerpo.data.map((r) => r.id), [1]);
      assert.deepEqual((await carlos.get('/repuestos?orden=precio&limite=2')).cuerpo.data.map((r) => r.id), [3, 2]);
      assert.deepEqual((await carlos.get('/repuestos?orden=stock&limite=2')).cuerpo.data.map((r) => r.id), [6, 4]);
    });

    it('rechaza consultas invalidas', async () => {
      for (const consulta of ['disponible=quizas', 'orden=marca', 'buscar=']) {
        assert.equal((await carlos.get(`/repuestos?${consulta}`)).status, 400, consulta);
      }
      assert.equal((await carlos.get('/repuestos/99')).cuerpo.codigo, 'REPUESTO_NO_ENCONTRADO');
    });

    it('solo admin crea, con codigo en mayusculas y unico', async () => {
      const { status, cuerpo } = await admin.post('/repuestos', { codigo: 'esp-01', nombre: 'Espejo izquierdo', precio: 7.75, stock: 12 });
      assert.equal(status, 201);
      assert.deepEqual(cuerpo.data, { id: 7, codigo: 'ESP-01', nombre: 'Espejo izquierdo', precio: 7.75, stock: 12 });
      const repetido = await admin.post('/repuestos', { codigo: 'Esp-01', nombre: 'Espejo derecho', precio: 7.75, stock: 1 });
      assert.equal(repetido.cuerpo.codigo, 'REPUESTO_DUPLICADO');
      for (const cambio of [{ precio: 0 }, { precio: '5' }, { stock: -1 }, { stock: 1.5 }, { codigo: 'a b' }, { nombre: 'x' }]) {
        const respuesta = await admin.post('/repuestos', { codigo: 'NUE-01', nombre: 'Repuesto valido', precio: 5, stock: 1, ...cambio });
        assert.equal(respuesta.status, 400, JSON.stringify(cambio));
      }
    });

    it('actualiza nombre y precio pero no el stock', async () => {
      const ok = await admin.patch('/repuestos/3', { precio: 4.5 });
      assert.equal(ok.cuerpo.data.precio, 4.5);
      assert.equal(ok.cuerpo.data.stock, 30);
      assert.equal((await admin.patch('/repuestos/3', { stock: 100 })).status, 400);
      assert.equal((await admin.patch('/repuestos/99', { precio: 1 })).status, 404);
    });

    it('reabastece sumando al stock', async () => {
      const { status, cuerpo } = await admin.post('/repuestos/6/reabastecer', { cantidad: 10 });
      assert.equal(status, 200);
      assert.equal(cuerpo.data.stock, 10);
      for (const cantidad of [0, -3, 1.5, 'x', 10001]) {
        assert.equal((await admin.post('/repuestos/6/reabastecer', { cantidad })).status, 400, String(cantidad));
      }
      assert.equal((await admin.post('/repuestos/99/reabastecer', { cantidad: 1 })).status, 404);
      assert.equal((await lucia.post('/repuestos/6/reabastecer', { cantidad: 1 })).status, 403);
    });
  });
});
