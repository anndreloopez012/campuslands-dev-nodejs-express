import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp, crearRouter } from '../src/app.js';
import { especificacion } from '../src/docs/openapi.js';
import { referenciasRotas, resolver, validar } from '../src/docs/validador.js';
import { levantar } from '../soporte/cliente.js';

const METODOS = ['get', 'post', 'put', 'patch', 'delete'];
const aPlantilla = (ruta) => ruta.replace(/:(\w+)/g, '{$1}');

function operaciones() {
  const lista = [];
  for (const [ruta, item] of Object.entries(especificacion.paths)) {
    for (const metodo of METODOS) {
      if (item[metodo]) lista.push({ ruta, metodo, op: item[metodo], comunes: item.parameters ?? [] });
    }
  }
  return lista;
}

function operacionPara(metodo, ruta) {
  const sinQuery = ruta.split('?')[0];
  return operaciones().find((o) => o.metodo === metodo && new RegExp(`^${o.ruta.replace(/\{\w+\}/g, '[^/]+')}$`).test(sinQuery));
}

let api;
before(async () => { api = await levantar(crearApp({ registro: () => {} })); });
after(async () => { await api.cerrar(); });

describe('la especificacion coincide con el codigo', () => {
  it('cada ruta de express esta documentada y cada ruta documentada existe', () => {
    const router = crearRouter();
    const enCodigo = router.stack
      .filter((capa) => capa.route)
      .flatMap((capa) => Object.keys(capa.route.methods).filter((m) => m !== '_all').map((m) => `${m} ${aPlantilla(capa.route.path)}`))
      .sort();
    const enSpec = operaciones().map((o) => `${o.metodo} ${o.ruta}`).sort();
    assert.deepEqual(enSpec, enCodigo);
  });

  it('no tiene referencias rotas ni operationId repetidos', () => {
    assert.deepEqual(referenciasRotas(especificacion), []);
    const ids = operaciones().map((o) => o.op.operationId);
    assert.equal(new Set(ids).size, ids.length);
    assert.throws(() => resolver(especificacion, 'http://otro/esquema'), /internas/);
  });

  it('cada operacion tiene resumen, una respuesta 2xx y declara sus parametros de ruta', () => {
    for (const { ruta, op, comunes } of operaciones()) {
      assert.ok(op.summary, `${ruta} sin summary`);
      assert.ok(Object.keys(op.responses).some((c) => /^2\d\d$/.test(c)), `${ruta} sin 2xx`);
      const enRuta = [...ruta.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
      const declarados = [...comunes, ...(op.parameters ?? [])].filter((p) => p.in === 'path').map((p) => p.name);
      assert.deepEqual(declarados.sort(), enRuta.sort(), ruta);
    }
  });

  it('los ejemplos de request cumplen su esquema y la API los acepta', async () => {
    for (const { ruta, metodo, op } of operaciones()) {
      const contenido = op.requestBody?.content?.['application/json'];
      if (!contenido) continue;
      for (const { value } of Object.values(contenido.examples)) {
        assert.deepEqual(validar(contenido.schema, value, especificacion), [], `${ruta} ejemplo invalido`);
        const r = await api.json(ruta, value, metodo.toUpperCase());
        assert.ok(r.status >= 200 && r.status < 300, `${ruta} rechazo su propio ejemplo: ${r.status}`);
      }
    }
  });

  it('los ejemplos de error cumplen el esquema Error', () => {
    for (const r of Object.values(especificacion.components.responses)) {
      assert.deepEqual(validar(r.content['application/json'].schema, r.content['application/json'].example, especificacion), []);
    }
  });
});

describe('las respuestas reales cumplen lo documentado', () => {
  const casos = [
    ['GET', '/'],
    ['GET', '/elementos'],
    ['GET', '/elementos/Fe'],
    ['GET', '/elementos/Xx'],
    ['GET', '/elementos/fe'],
    ['POST', '/formulas/analisis', { formula: 'K4[Fe(CN)6]' }],
    ['POST', '/formulas/analisis', { formula: 'H2Xy' }],
    ['POST', '/formulas/conversion', { formula: 'C6H12O6', gramos: 90 }],
    ['POST', '/formulas/conversion', { formula: 'H2O', gramos: -1 }],
    ['GET', '/compuestos?categoria=acido'],
    ['GET', '/compuestos?categoria=gas'],
    ['POST', '/compuestos', { nombre: 'Amoniaco', formula: 'NH3', categoria: 'base' }],
    ['POST', '/compuestos', { nombre: 'Agua otra vez', formula: 'H2O', categoria: 'oxido' }],
    ['POST', '/compuestos', { nombre: 'x' }],
    ['GET', '/compuestos/4'],
    ['GET', '/compuestos/99'],
    ['GET', '/compuestos/abc'],
    ['DELETE', '/compuestos/5'],
    ['DELETE', '/compuestos/5'],
  ];

  for (const [metodo, ruta, cuerpo] of casos) {
    it(`${metodo} ${ruta} -> status documentado y body valido`, async () => {
      const r = cuerpo ? await api.json(ruta, cuerpo, metodo) : await api.pedir(ruta, { method: metodo });
      const { op } = operacionPara(metodo.toLowerCase(), ruta);
      let documentada = op.responses[r.status];
      assert.ok(documentada, `status ${r.status} no documentado en ${metodo} ${ruta}`);
      if (documentada.$ref) documentada = resolver(especificacion, documentada.$ref);
      const esquema = documentada.content?.['application/json']?.schema;
      if (esquema) assert.deepEqual(validar(esquema, r.cuerpo, especificacion), [], JSON.stringify(r.cuerpo));
      else assert.equal(r.cuerpo, null);
    });
  }

  it('POST sin Content-Type da el 415 documentado', async () => {
    const r = await api.pedir('/formulas/analisis', { method: 'POST', body: 'H2O' });
    assert.equal(r.status, 415);
    assert.ok(especificacion.paths['/formulas/analisis'].post.responses[415]);
  });
});

describe('publicacion de la especificacion', () => {
  it('sirve openapi.json con ETag y 304', async () => {
    const r = await api.pedir('/openapi.json');
    assert.deepEqual(r.cuerpo, JSON.parse(JSON.stringify(especificacion)));
    const etag = r.cabeceras.get('etag');
    const otra = await api.pedir('/openapi.json', { headers: { 'if-none-match': etag } });
    assert.equal(otra.status, 304);
  });

  it('genera una pagina html con todas las operaciones', async () => {
    const r = await api.pedir('/docs');
    assert.match(r.cabeceras.get('content-type'), /text\/html/);
    for (const { ruta, metodo } of operaciones()) assert.ok(r.cuerpo.includes(`${metodo.toUpperCase()}</span> <code>${ruta}</code>`), ruta);
    assert.ok(r.cuerpo.includes('&quot;formula&quot;: &quot;Ca(OH)2&quot;'));
  });
});

describe('validador', () => {
  it('reporta tipos, requeridos, enums, rangos y propiedades extra con su ruta', () => {
    const errores = validar({ $ref: '#/components/schemas/Compuesto' }, {
      id: 0, nombre: 1, formula: 'H2O', categoria: 'gas', extra: true,
    }, especificacion);
    assert.deepEqual(errores.map((e) => e.ruta), ['$', '$.id', '$.nombre', '$.categoria', '$']);
    assert.deepEqual(validar({ type: 'array', minItems: 1 }, [], especificacion)[0].mensaje, 'minimo 1 elementos');
    assert.deepEqual(validar({ type: ['string', 'null'] }, null, especificacion), []);
  });
});
