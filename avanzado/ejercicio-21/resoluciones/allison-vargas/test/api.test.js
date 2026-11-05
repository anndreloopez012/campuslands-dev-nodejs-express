import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp, crearServicios } from '../src/app.js';
import { crearRenderizadorSimulado } from '../src/services/renderizador.js';
import { levantar } from '../soporte/cliente.js';
import { esperarHasta } from '../soporte/renderizador.js';

async function conApi(prueba, opciones = {}) {
  const servicios = crearServicios({
    reloj: () => new Date('2026-11-05T12:00:00.000Z'),
    renderizar: crearRenderizadorSimulado({ msPorFrame: { borrador: 2, final: 15 } }),
    ...opciones,
  });
  const api = await levantar(crearApp({ servicios, registro: () => {} }));
  try {
    await prueba({
      ...api,
      servicios,
      render: (cuerpo, cliente = 'estudio-uno') => api.json('/renders', cuerpo, 'POST', { 'x-cliente-id': cliente }),
    });
  } finally {
    await api.cerrar();
  }
}

const ESCENA = { nombre: 'Bosque al atardecer', luces: 4, objetos: [{ nombre: 'arbol', poligonos: 130000 }] };

describe('concurrencia optimista en escenas', () => {
  it('exige If-Match y rechaza ediciones sobre una version vieja', () => conApi(async (api) => {
    const leida = await api.pedir('/escenas/1');
    assert.equal(leida.cabeceras.get('etag'), '"v1"');
    const sin = await api.json('/escenas/1', ESCENA, 'PUT');
    assert.equal(sin.status, 428);

    const ana = await api.json('/escenas/1', { ...ESCENA, luces: 5 }, 'PUT', { 'if-match': '"v1"' });
    assert.equal(ana.status, 200);
    assert.equal(ana.cabeceras.get('etag'), '"v2"');
    const beto = await api.json('/escenas/1', { ...ESCENA, luces: 9 }, 'PUT', { 'if-match': '"v1"' });
    assert.equal(beto.status, 412);
    assert.equal(beto.cuerpo.codigo, 'CONFLICTO_DE_VERSION');
    assert.equal(beto.cabeceras.get('etag'), '"v2"');
    assert.equal((await api.pedir('/escenas/1')).cuerpo.data.luces, 5);

    const varias = await api.json('/escenas/1', ESCENA, 'PUT', { 'if-match': '"v1", "v2"' });
    assert.equal(varias.cuerpo.data.version, 3);
    const comodin = await api.json('/escenas/1', ESCENA, 'PUT', { 'if-match': '*' });
    assert.equal(comodin.cuerpo.data.version, 4);
  }));

  it('crea escenas y valida su contenido', () => conApi(async (api) => {
    const r = await api.json('/escenas', ESCENA);
    assert.equal(r.status, 201);
    assert.equal(r.cabeceras.get('etag'), '"v1"');
    const malo = await api.json('/escenas', { nombre: 'x', luces: -1, objetos: [{ nombre: 'a', poligonos: 0 }, 3] });
    assert.deepEqual(malo.cuerpo.errores.map((e) => e.campo), ['nombre', 'luces', 'objetos[0].poligonos', 'objetos[1]']);
    assert.equal((await api.pedir('/escenas/42')).cuerpo.codigo, 'ESCENA_NO_ENCONTRADA');
  }));
});

describe('single flight en vista previa', () => {
  it('cinco peticiones simultaneas hacen un solo calculo', () => conApi(async (api) => {
    const respuestas = await Promise.all(Array.from({ length: 5 }, () => api.pedir('/escenas/2/vista-previa')));
    assert.ok(respuestas.every((r) => r.cuerpo.data.poligonos === 1_200_000));
    assert.equal(api.servicios.escenas.calculos, 1);
    await api.json('/escenas/2', { ...ESCENA, objetos: [{ nombre: 'torre', poligonos: 10 }] }, 'PUT', { 'if-match': '"v1"' });
    const nueva = await api.pedir('/escenas/2/vista-previa');
    assert.equal(nueva.cuerpo.data.version, 2);
    assert.equal(api.servicios.escenas.calculos, 2);
  }));
});

describe('renders', () => {
  it('acepta con 202, informa progreso y termina con la version de la escena', () => conApi(async (api) => {
    const r = await api.render({ escenaId: 3, frames: 4 });
    assert.equal(r.status, 202);
    assert.equal(r.cabeceras.get('location'), `/avanzado/ejercicio-21/renders/${r.cuerpo.data.id}`);
    await esperarHasta(async () => (await api.pedir(`/renders/${r.cuerpo.data.id}`)).cuerpo.data.estado === 'completado');
    const fin = (await api.pedir(`/renders/${r.cuerpo.data.id}`)).cuerpo.data;
    assert.equal(fin.resultado.archivo, 'escena-3-v1-borrador.mp4');
    assert.equal(fin.progreso, 100);
    assert.equal(fin.controlador, undefined);
  }));

  it('aplica limites por cliente (429) y de cola (503) con Retry-After', () => conApi(async (api) => {
    const largo = { escenaId: 1, calidad: 'final', frames: 200 };
    const enviados = [];
    for (const cliente of ['a-uno', 'b-dos', 'c-tres', 'd-cuatro']) {
      enviados.push(await api.render(largo, cliente));
      enviados.push(await api.render(largo, cliente));
    }
    assert.ok(enviados.slice(0, 7).every((r) => r.status === 202));
    const lleno = enviados[7];
    assert.equal(lleno.status, 503);
    assert.equal(lleno.cuerpo.codigo, 'COLA_LLENA');
    assert.equal(lleno.cabeceras.get('retry-after'), '10');
    const porCliente = await api.render(largo, 'a-uno');
    assert.equal(porCliente.status, 429);
    assert.equal(porCliente.cabeceras.get('retry-after'), '5');
    const cola = (await api.pedir('/cola')).cuerpo.data;
    assert.deepEqual([cola.renderizando, cola.enCola], [2, 5]);

    const cancelado = await api.pedir(`/renders/${enviados[6].cuerpo.data.id}`, { method: 'DELETE', headers: { 'x-cliente-id': 'd-cuatro' } });
    assert.equal(cancelado.cuerpo.data.estado, 'cancelado');
    const ajeno = await api.pedir(`/renders/${enviados[0].cuerpo.data.id}`, { method: 'DELETE', headers: { 'x-cliente-id': 'd-cuatro' } });
    assert.equal(ajeno.status, 404);
    assert.equal((await api.render(largo, 'e-cinco')).status, 202);
    for (const r of enviados.filter((x) => x.status === 202)) {
      const id = r.cuerpo.data.id;
      const cliente = r.cuerpo.data.cliente;
      await api.pedir(`/renders/${id}`, { method: 'DELETE', headers: { 'x-cliente-id': cliente } });
    }
  }));

  it('valida cliente y datos', () => conApi(async (api) => {
    assert.equal((await api.json('/renders', { escenaId: 1, frames: 2 })).status, 401);
    assert.equal((await api.render({ escenaId: 1, frames: 0, calidad: '8k' })).cuerpo.errores.length, 2);
    assert.equal((await api.render({ escenaId: 99, frames: 2 })).cuerpo.codigo, 'ESCENA_NO_ENCONTRADA');
    assert.equal((await api.pedir('/renders/77')).status, 404);
    assert.equal((await api.pedir('/')).cuerpo.topic, 'concurrencia controlada');
  }));
});
