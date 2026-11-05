import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { construirOpenApi } from '../src/docs/openapi.js';
import { describirOperaciones, resolver } from '../src/docs/modelo.js';
import { validarEsquema } from '../soporte/esquema.js';
import { levantar } from '../soporte/cliente.js';

const spec = construirOpenApi();
const operaciones = describirOperaciones(spec);
const porId = (id) => operaciones.find((op) => op.id === id);
const respuestaDocumentada = (op, codigo) => {
  const documentada = spec.paths[op.ruta][op.metodo.toLowerCase()].responses[codigo];
  return documentada ? resolver(spec, documentada) : undefined;
};

describe('las respuestas reales cumplen lo documentado', () => {
  let cliente;

  beforeEach(async () => {
    cliente = await levantar();
  });

  afterEach(() => cliente.cerrar());

  const peticion = (op) => {
    const url = op.parametros
      .filter((p) => p.en === 'path')
      .reduce((ruta, p) => ruta.replace(`{${p.nombre}}`, p.ejemplo), op.ruta);
    const consulta = op.parametros.filter((p) => p.en === 'query' && p.ejemplo !== undefined);
    const query = consulta.length ? `?${consulta.map((p) => `${p.nombre}=${p.ejemplo}`).join('&')}` : '';
    const opciones = { method: op.metodo };
    if (op.cuerpo) {
      opciones.headers = { 'content-type': 'application/json' };
      opciones.body = JSON.stringify(op.cuerpo.ejemplo);
    }
    return { ruta: `${url === '/' ? '' : url}${op.metodo === 'GET' ? query : ''}`, opciones };
  };

  describe('usando los ejemplos de cada operacion', () => {
    for (const op of operaciones) {
      it(`${op.metodo} ${op.ruta} (${op.id})`, async () => {
        const { ruta, opciones } = peticion(op);
        const { status, cuerpo, cabeceras } = await cliente.pedir(ruta, opciones);

        const exito = op.respuestas.find((r) => r.codigo.startsWith('2'));
        assert.equal(String(status), exito.codigo);
        assert.match(cabeceras.get('content-type'), new RegExp(`^${exito.tipoContenido.replace('/', '\\/')}`));

        for (const cabecera of exito.cabeceras) {
          assert.ok(cabeceras.get(cabecera.toLowerCase()), `falta el header ${cabecera}`);
        }

        if (exito.tipoContenido === 'application/json') {
          const esquema = respuestaDocumentada(op, exito.codigo).content['application/json'].schema;
          assert.deepEqual(validarEsquema(spec, esquema, cuerpo), []);
        }
      });
    }
  });

  describe('en los casos de error', () => {
    const json = { 'content-type': 'application/json' };
    const casos = [
      ['listarEquipos', 400, '/equipos?region=marte'],
      ['crearEquipo', 400, '/equipos', { method: 'POST', headers: json, body: '{}' }],
      ['crearEquipo', 409, '/equipos', { method: 'POST', headers: json, body: JSON.stringify({ nombre: 'Otro', tag: 'NBF', region: 'eu' }) }],
      ['crearEquipo', 415, '/equipos', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' }],
      ['obtenerEquipo', 400, '/equipos/abc'],
      ['obtenerEquipo', 404, '/equipos/99'],
      ['actualizarEquipo', 400, '/equipos/2', { method: 'PATCH', headers: json, body: JSON.stringify({ tag: 'ABC' }) }],
      ['actualizarEquipo', 404, '/equipos/99', { method: 'PATCH', headers: json, body: JSON.stringify({ region: 'eu' }) }],
      ['actualizarEquipo', 409, '/equipos/2', { method: 'PATCH', headers: json, body: JSON.stringify({ nombre: 'nebula five' }) }],
      ['eliminarEquipo', 404, '/equipos/99', { method: 'DELETE' }],
      ['eliminarEquipo', 409, '/equipos/1', { method: 'DELETE' }],
      ['listarTorneos', 400, '/torneos?estado=nunca'],
      ['obtenerTorneo', 404, '/torneos/99'],
      ['listarInscripciones', 404, '/torneos/99/inscripciones'],
      ['inscribirEquipo', 400, '/torneos/1/inscripciones', { method: 'POST', headers: json, body: '{}' }],
      ['inscribirEquipo', 404, '/torneos/99/inscripciones', { method: 'POST', headers: json, body: JSON.stringify({ equipoId: 1 }) }],
      ['inscribirEquipo', 409, '/torneos/3/inscripciones', { method: 'POST', headers: json, body: JSON.stringify({ equipoId: 7 }) }],
      ['inscribirEquipo', 409, '/torneos/2/inscripciones', { method: 'POST', headers: json, body: JSON.stringify({ equipoId: 7 }) }],
      ['inscribirEquipo', 409, '/torneos/1/inscripciones', { method: 'POST', headers: json, body: JSON.stringify({ equipoId: 1 }) }],
      ['inscribirEquipo', 415, '/torneos/1/inscripciones', { method: 'POST' }],
      ['inscribirEquipo', 422, '/torneos/1/inscripciones', { method: 'POST', headers: json, body: JSON.stringify({ equipoId: 99 }) }],
      ['retirarEquipo', 404, '/torneos/1/inscripciones/7', { method: 'DELETE' }],
      ['retirarEquipo', 409, '/torneos/2/inscripciones/1', { method: 'DELETE' }],
    ];

    for (const [id, estado, ruta, opciones] of casos) {
      it(`${id} responde ${estado} (${ruta})`, async () => {
        const op = porId(id);
        const documentada = respuestaDocumentada(op, estado);
        assert.ok(documentada, `${id} no documenta el ${estado}`);

        const { status, cuerpo } = await cliente.pedir(ruta, opciones);
        assert.equal(status, estado);
        assert.deepEqual(validarEsquema(spec, documentada.content['application/json'].schema, cuerpo), []);
      });
    }
  });
});
