import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { BASE_RUTAS } from '../src/constants/rutas.js';
import { construirOpenApi } from '../src/docs/openapi.js';
import { listarRutas } from '../src/docs/introspeccion.js';
import { levantar } from '../soporte/cliente.js';

const spec = construirOpenApi();
const claves = (lista) => lista.map(({ metodo, ruta }) => `${metodo} ${ruta}`).sort();

const documentadas = Object.entries(spec.paths).flatMap(([ruta, item]) =>
  Object.keys(item).map((metodo) => ({ metodo: metodo.toUpperCase(), ruta })));

describe('la documentacion coincide con las rutas reales', () => {
  const registradas = listarRutas(crearApp(), BASE_RUTAS);

  it('Express registra rutas y la introspeccion las encuentra', () => {
    assert.equal(registradas.length, 13);
    assert.ok(registradas.some((r) => r.metodo === 'GET' && r.ruta === '/'));
    assert.ok(registradas.some((r) => r.metodo === 'DELETE' && r.ruta === '/torneos/{id}/inscripciones/{equipoId}'));
  });

  it('toda ruta registrada en Express esta documentada', () => {
    const faltantes = claves(registradas).filter((clave) => !claves(documentadas).includes(clave));
    assert.deepEqual(faltantes, []);
  });

  it('toda ruta documentada existe en Express', () => {
    const sobrantes = claves(documentadas).filter((clave) => !claves(registradas).includes(clave));
    assert.deepEqual(sobrantes, []);
  });
});

describe('metodos no documentados', () => {
  let cliente;

  before(async () => {
    cliente = await levantar();
  });

  after(() => cliente.cerrar());

  const METODOS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  for (const [ruta, item] of Object.entries(spec.paths)) {
    const permitidos = Object.keys(item).map((m) => m.toUpperCase());
    for (const metodo of METODOS.filter((m) => !permitidos.includes(m))) {
      it(`${metodo} ${ruta} responde 405 con Allow`, async () => {
        const url = ruta.replace(/\{\w+\}/g, '1');
        const { status, cabeceras, cuerpo } = await cliente.pedir(url === '/' ? '' : url, { method: metodo });
        assert.equal(status, 405);
        assert.equal(cuerpo.codigo, 'METODO_NO_PERMITIDO');
        const allow = cabeceras.get('allow').split(',').map((valor) => valor.trim()).sort();
        assert.deepEqual(allow, [...permitidos].sort());
      });
    }
  }
});
