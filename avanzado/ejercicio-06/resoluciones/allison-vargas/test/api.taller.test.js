import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/api.js';
import { ORDEN_BASE } from '../soporte/entorno.js';

describe('API de mecanicos', () => {
  let api;
  beforeEach(async () => { api = await levantarApi(); });
  afterEach(() => api.cerrar());

  it('lista mecanicos con su ocupacion', async () => {
    const { cuerpo } = await api.pedir('/trabajadores');
    assert.equal(cuerpo.data.length, 4);
    assert.ok(cuerpo.data.every((m) => m.ocupados === 0));
    const uno = await api.pedir('/trabajadores/4');
    assert.equal(uno.cuerpo.data.capacidad, 2);
    assert.equal((await api.pedir('/trabajadores/9')).cuerpo.codigo, 'TRABAJADOR_NO_ENCONTRADO');
  });

  it('solo reclama trabajos de sus habilidades y respeta su capacidad', async () => {
    await api.json('/trabajos', { tipo: 'electrica', carga: { componente: 'luces' } });
    await api.json('/trabajos', { tipo: 'lavado' });
    const rafa = await api.json('/trabajadores/1/reclamar', { max: 3 });
    assert.equal(rafa.cuerpo.total, 0);
    const lucia = await api.json('/trabajadores/2/reclamar', { max: 3 });
    assert.deepEqual(lucia.cuerpo.data.map((t) => t.tipo), ['lavado']);
    await api.json('/trabajos', { tipo: 'lavado' });
    const lleno = await api.json('/trabajadores/2/reclamar', {});
    assert.equal(lleno.status, 409);
    assert.equal(lleno.cuerpo.codigo, 'TRABAJADOR_OCUPADO');
    assert.deepEqual(lleno.cuerpo.contexto, { trabajadorId: 2, ocupados: 1, capacidad: 1 });
    assert.equal((await api.pedir('/trabajadores/2')).cuerpo.data.ocupados, 1);
  });

  it('un mecanico con capacidad 2 puede llevar dos a la vez', async () => {
    await api.json('/trabajos', { tipo: 'lavado' });
    await api.json('/trabajos', { tipo: 'lavado' });
    const camila = await api.json('/trabajadores/4/reclamar', { max: 5 });
    assert.equal(camila.cuerpo.total, 2);
  });

  it('valida max al reclamar', async () => {
    const { status, cuerpo } = await api.json('/trabajadores/1/reclamar', { max: 9, otro: 1 });
    assert.equal(status, 400);
    assert.deepEqual(cuerpo.errores.map((e) => e.campo).sort(), ['max', 'otro']);
  });
});

describe('API de ordenes', () => {
  let api;
  beforeEach(async () => { api = await levantarApi(); });
  afterEach(() => api.cerrar());

  it('crea una orden con su grafo de trabajos', async () => {
    const { status, cuerpo, cabeceras } = await api.json('/ordenes', ORDEN_BASE);
    assert.equal(status, 201);
    assert.equal(cabeceras.get('location'), '/avanzado/ejercicio-06/ordenes/1');
    const orden = cuerpo.data;
    assert.equal(orden.moto.placa, 'M123ABC');
    assert.deepEqual(orden.trabajos.map((t) => t.tipo), ['diagnostico', 'frenos', 'afinacion', 'lavado']);
    assert.deepEqual(orden.trabajos.map((t) => t.estado), ['pendiente', 'bloqueada', 'bloqueada', 'bloqueada']);
    assert.equal(orden.trabajos[3].prioridad, 3);
    assert.equal(orden.estado, 'en_espera');
  });

  it('el procesador lleva la orden hasta quedar lista', async () => {
    await api.json('/ordenes', ORDEN_BASE);
    let total = 0;
    for (let ronda = 0; ronda < 5; ronda += 1) {
      const { cuerpo } = await api.json('/procesador/ejecutar', {});
      total += cuerpo.total;
    }
    assert.equal(total, 4);
    const orden = (await api.pedir('/ordenes/1')).cuerpo.data;
    assert.equal(orden.estado, 'lista');
    assert.deepEqual(orden.progreso, { completadas: 4, total: 4 });
    assert.equal(orden.costoTotal, 50 + 300 + 160 + 40);
  });

  it('con fallos simulados la orden se recupera usando el reloj virtual', async () => {
    const cuerpo = { ...ORDEN_BASE, servicios: [{ tipo: 'frenos', eje: 'delantero', fallosSimulados: 2 }] };
    await api.json('/ordenes', cuerpo);
    const primera = (await api.json('/procesador/ejecutar', {})).cuerpo.data;
    assert.deepEqual(primera.map((s) => s.resultado), ['completada', 'fallida']);
    assert.equal((await api.pedir('/ordenes/1')).cuerpo.data.estado, 'en_proceso');
    api.avanzar(2000);
    const segunda = (await api.json('/procesador/ejecutar', {})).cuerpo.data;
    assert.equal(segunda[0].resultado, 'fallida');
    api.avanzar(4000);
    const tercera = (await api.json('/procesador/ejecutar', {})).cuerpo.data;
    assert.equal(tercera[0].resultado, 'completada');
    api.avanzar(500);
    await api.json('/procesador/ejecutar', {});
    assert.equal((await api.pedir('/ordenes/1')).cuerpo.data.estado, 'lista');
  });

  it('si un trabajo muere, la orden queda con problemas y reencolar la rescata', async () => {
    const cuerpo = { ...ORDEN_BASE, servicios: [{ tipo: 'frenos', eje: 'delantero', fallosSimulados: 5 }] };
    await api.json('/ordenes', { ...cuerpo, incluirLavado: true });
    await api.json('/procesador/ejecutar', {});
    for (const espera of [2000, 4000]) {
      api.avanzar(espera);
      await api.json('/procesador/ejecutar', {});
    }
    const orden = (await api.pedir('/ordenes/1')).cuerpo.data;
    assert.equal(orden.estado, 'con_problemas');
    assert.equal(orden.trabajos.at(-1).estado, 'cancelada');
    assert.equal(orden.trabajos.at(-1).canceladaPor, 2);
    const revivido = await api.json('/trabajos/2/reencolar', undefined);
    assert.equal(revivido.status, 200);
    const despues = (await api.pedir('/ordenes/1')).cuerpo.data;
    assert.equal(despues.trabajos.at(-1).estado, 'bloqueada');
    assert.equal(despues.estado, 'en_proceso');
  });

  it('valida la orden completa', async () => {
    const { status, cuerpo } = await api.json('/ordenes', {
      cliente: 'A',
      moto: { marca: 'Y', modelo: '', cilindrada: 10, placa: 'ab' },
      sintomas: ['truenos'],
      servicios: [{ tipo: 'pintura' }, { tipo: 'frenos' }],
    });
    assert.equal(status, 400);
    const campos = cuerpo.errores.map((e) => e.campo);
    for (const esperado of ['cliente', 'moto.marca', 'moto.modelo', 'moto.cilindrada', 'moto.placa', 'servicios[0].tipo', 'servicios[1].eje']) {
      assert.ok(campos.includes(esperado), esperado);
    }
    assert.ok(campos.some((c) => c.startsWith('sintomas')));
  });

  it('lista ordenes sin repetir sus trabajos', async () => {
    await api.json('/ordenes', ORDEN_BASE);
    await api.json('/ordenes', { ...ORDEN_BASE, incluirLavado: false });
    const { cuerpo, cabeceras } = await api.pedir('/ordenes');
    assert.equal(cuerpo.paginacion.total, 2);
    assert.equal(cabeceras.get('x-total-count'), '2');
    assert.equal('trabajos' in cuerpo.data[0], false);
    assert.equal(cuerpo.data[1].progreso.total, 3);
    assert.equal((await api.pedir('/ordenes/8')).cuerpo.codigo, 'ORDEN_NO_ENCONTRADA');
  });

  it('una orden fallida a mitad de camino no deja trabajos activos', async () => {
    const original = api.servicios.cola.encolar.bind(api.servicios.cola);
    let llamadas = 0;
    api.servicios.cola.encolar = (datos) => {
      llamadas += 1;
      if (llamadas === 3) throw new Error('sin cupo');
      return original(datos);
    };
    const { status } = await api.json('/ordenes', ORDEN_BASE);
    assert.equal(status, 500);
    const activos = api.servicios.cola.listar().filter((t) => t.estado !== 'cancelada');
    assert.equal(activos.length, 0);
    assert.equal((await api.pedir('/ordenes')).cuerpo.paginacion.total, 0);
  });
});

describe('API de sistema', () => {
  it('estadisticas y reloj virtual', async () => {
    const api = await levantarApi({ relojVirtual: true });
    try {
      const reloj = await api.pedir('/reloj');
      assert.equal(reloj.cuerpo.data.virtual, true);
      const antes = reloj.cuerpo.data.ahora;
      const adelantado = await api.json('/reloj/avanzar', { ms: 60000 });
      assert.equal(Date.parse(adelantado.cuerpo.data.ahora) - Date.parse(antes), 60000);
      const malo = await api.json('/reloj/avanzar', { ms: 0 });
      assert.equal(malo.status, 400);
      const stats = await api.pedir('/estadisticas');
      assert.equal(stats.cuerpo.data.total, 0);
    } finally {
      await api.cerrar();
    }
  });

  it('con reloj real no se puede avanzar el tiempo', async () => {
    const { levantar } = await import('../soporte/cliente.js');
    const { crearApp } = await import('../src/app.js');
    const { crearServicios } = await import('../src/services/index.js');
    const api = await levantar(crearApp({ servicios: crearServicios() }));
    try {
      const reloj = await api.pedir('/reloj');
      assert.equal(reloj.cuerpo.data.virtual, false);
      const { status, cuerpo } = await api.json('/reloj/avanzar', { ms: 1000 });
      assert.equal(status, 409);
      assert.equal(cuerpo.codigo, 'RELOJ_REAL');
    } finally {
      await api.cerrar();
    }
  });

  it('con simulaciones deshabilitadas se rechazan las cargas de prueba con 403', async () => {
    const api = await levantarApi({ permitirSimulaciones: false });
    try {
      const trabajo = await api.json('/trabajos', { tipo: 'lavado', carga: { colgar: true } });
      assert.equal(trabajo.status, 403);
      assert.equal(trabajo.cuerpo.codigo, 'SIMULACION_DESHABILITADA');
      const orden = await api.json('/ordenes', { ...ORDEN_BASE, servicios: [{ tipo: 'frenos', eje: 'ambos', fallosSimulados: 1 }] });
      assert.equal(orden.status, 403);
      const normal = await api.json('/trabajos', { tipo: 'lavado' });
      assert.equal(normal.status, 201);
    } finally {
      await api.cerrar();
    }
  });
});
