import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi, subir } from '../soporte/api.js';
import { COMBATE_BASE, lineas } from '../soporte/entorno.js';

describe('consultas', () => {
  let api;
  before(async () => { api = await levantarApi({ total: 300 }); });
  after(() => api.cerrar());

  it('responde el mensaje base del ejercicio', async () => {
    const r = await api.pedir('/');
    assert.equal(r.status, 200);
    assert.deepEqual(r.cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'streams basicos' });
  });

  it('lista combates con paginacion y filtros', async () => {
    const r = await api.pedir('/combates?pagina=2&limite=5&categoria=ligero');
    assert.equal(r.status, 200);
    assert.equal(r.cuerpo.data.length, 5);
    assert.equal(r.cuerpo.paginacion.pagina, 2);
    assert.ok(r.cuerpo.data.every((c) => c.categoria === 'ligero'));
    const todos = await api.pedir('/combates?limite=50&categoria=ligero&pagina=1');
    assert.equal(todos.cuerpo.paginacion.total, r.cuerpo.paginacion.total);
    assert.deepEqual(r.cuerpo.data[0], (await api.pedir('/combates?limite=5&categoria=ligero&pagina=2')).cuerpo.data[0]);
  });

  it('una pagina fuera de rango devuelve la lista vacia con el total', async () => {
    const r = await api.pedir('/combates?pagina=100&limite=10');
    assert.deepEqual(r.cuerpo.data, []);
    assert.equal(r.cuerpo.paginacion.total, 300);
  });

  it('rechaza filtros y paginas invalidas', async () => {
    const r = await api.pedir('/combates?limite=500&metodo=baile&desde=ayer&otro=1');
    assert.equal(r.status, 400);
    assert.deepEqual(r.cuerpo.errores.map((e) => e.campo).sort(), ['desde', 'limite', 'metodo', 'otro']);
  });

  it('obtiene un combate por id', async () => {
    const r = await api.pedir('/combates/10');
    assert.equal(r.cuerpo.data.id, 10);
  });

  it('distingue id invalido de id inexistente', async () => {
    const malo = await api.pedir('/combates/abc');
    assert.equal(malo.status, 400);
    const falta = await api.pedir('/combates/301');
    assert.equal(falta.status, 404);
    assert.equal(falta.cuerpo.codigo, 'COMBATE_NO_ENCONTRADO');
  });

  it('calcula estadisticas leyendo el flujo completo', async () => {
    const r = await api.pedir('/combates/estadisticas');
    assert.equal(r.status, 200);
    const d = r.cuerpo.data;
    assert.equal(d.total, 300);
    assert.equal(Object.values(d.porMetodo).reduce((a, b) => a + b, 0), 300);
    assert.equal(Object.values(d.porCategoria).reduce((a, b) => a + b, 0), 300);
    assert.equal(d.masVictorias.length, 5);
    assert.ok(d.masVictorias[0].victorias >= d.masVictorias[1].victorias);
    assert.ok(d.masVictorias[0].nombre);
  });

  it('las estadisticas respetan los filtros y coinciden con la exportacion', async () => {
    const stats = await api.pedir('/combates/estadisticas?metodo=tko');
    const filas = (await api.pedir('/combates/exportar?metodo=tko')).cuerpo.trim().split('\n');
    assert.equal(stats.cuerpo.data.total, filas.length);
    assert.deepEqual(Object.keys(stats.cuerpo.data.porMetodo), ['tko']);
  });

  it('las estadisticas de un filtro vacio dan ceros', async () => {
    const r = await api.pedir('/combates/estadisticas?hasta=2000-01-01');
    assert.equal(r.cuerpo.data.total, 0);
    assert.equal(r.cuerpo.data.promedioRounds, 0);
    assert.equal(r.cuerpo.data.primeraFecha, null);
    assert.deepEqual(r.cuerpo.data.masVictorias, []);
  });

  it('las estadisticas incluyen lo que se importa', async () => {
    const antes = (await api.pedir('/combates/estadisticas?desde=2040-01-01')).cuerpo.data.total;
    await subir(api.origen, '/avanzado/ejercicio-09/combates/importar', [lineas({ ...COMBATE_BASE, fecha: '2040-01-01' })]);
    const despues = (await api.pedir('/combates/estadisticas?desde=2040-01-01')).cuerpo.data.total;
    assert.equal(antes, 0);
    assert.equal(despues, 1);
  });

  it('lista y consulta peleadores', async () => {
    const lista = await api.pedir('/peleadores?categoria=pesado&limite=2');
    assert.equal(lista.cuerpo.data.length, 2);
    assert.equal(lista.cuerpo.paginacion.total, 4);
    const uno = await api.pedir('/peleadores/3');
    assert.equal(uno.cuerpo.data.nombre, 'Kenji Mori');
    assert.equal((await api.pedir('/peleadores/99')).cuerpo.codigo, 'PELEADOR_NO_ENCONTRADO');
    assert.equal((await api.pedir('/peleadores?categoria=pluma')).status, 400);
  });
});

describe('protocolo y errores', () => {
  let api;
  const errores = [];
  before(async () => { api = await levantarApi({ total: 10, registro: (e) => errores.push(e) }); });
  after(() => api.cerrar());

  it('rutas inexistentes responden 404 en json', async () => {
    const r = await api.pedir('/nada');
    assert.equal(r.status, 404);
    assert.equal(r.cuerpo.codigo, 'RUTA_NO_ENCONTRADA');
  });

  it('OPTIONS responde 204 con Allow y otros metodos 405', async () => {
    const opciones = await api.pedir('/combates', { method: 'OPTIONS' });
    assert.equal(opciones.status, 204);
    assert.equal(opciones.cabeceras.get('allow'), 'GET');
    const borrar = await api.pedir('/combates/1', { method: 'DELETE' });
    assert.equal(borrar.status, 405);
  });

  it('un json mal formado responde JSON_INVALIDO', async () => {
    const r = await api.pedir('/combates', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
    assert.equal(r.status, 400);
    assert.equal(r.cuerpo.codigo, 'JSON_INVALIDO');
  });

  it('un fallo inesperado devuelve un 500 generico y se registra', async () => {
    const rota = await levantarApi({
      total: 10,
      registro: (e) => errores.push(e),
    });
    rota.servicios.combates.estadisticas = async () => { throw new Error('secreto interno'); };
    const r = await rota.pedir('/combates/estadisticas');
    await rota.cerrar();
    assert.equal(r.status, 500);
    assert.equal(r.cuerpo.codigo, 'ERROR_INTERNO');
    assert.ok(!JSON.stringify(r.cuerpo).includes('secreto'));
    assert.ok(errores.some((e) => e.mensaje === 'secreto interno'));
  });
});
