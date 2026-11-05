import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { construirOpenApi } from '../src/docs/openapi.js';
import { describirOperaciones, resolver } from '../src/docs/modelo.js';
import { renderizarHtml } from '../src/docs/html.js';
import { renderizarMarkdown } from '../src/docs/markdown.js';
import { generarArchivos } from '../src/docs/archivos.js';

const spec = construirOpenApi();
const operaciones = describirOperaciones(spec);
const carpetaDocs = path.join(path.dirname(fileURLToPath(import.meta.url)), '../docs');

function buscarRefs(nodo, salida = []) {
  if (Array.isArray(nodo)) nodo.forEach((item) => buscarRefs(item, salida));
  else if (nodo && typeof nodo === 'object') {
    for (const [clave, valor] of Object.entries(nodo)) {
      if (clave === '$ref') salida.push(valor);
      else buscarRefs(valor, salida);
    }
  }
  return salida;
}

describe('especificacion OpenAPI', () => {
  it('tiene la estructura basica de OpenAPI 3', () => {
    assert.match(spec.openapi, /^3\.0\.\d+$/);
    assert.ok(spec.info.title && spec.info.version && spec.info.description);
    assert.equal(spec.servers[0].url, '/intermedio/ejercicio-27');
  });

  it('todas las referencias $ref apuntan a algo que existe', () => {
    const refs = buscarRefs(spec);
    assert.ok(refs.length > 10);
    for (const referencia of refs) {
      assert.notEqual(resolver(spec, { $ref: referencia }), undefined, referencia);
    }
  });

  it('cada operacion tiene id unico, resumen, tag declarado y al menos una respuesta de exito', () => {
    const ids = new Set();
    const tags = spec.tags.map((tag) => tag.name);
    for (const op of operaciones) {
      assert.ok(op.id, `${op.metodo} ${op.ruta} sin operationId`);
      assert.ok(!ids.has(op.id), `operationId repetido: ${op.id}`);
      ids.add(op.id);
      assert.ok(op.resumen, `${op.id} sin resumen`);
      assert.ok(tags.includes(op.tag), `${op.id} usa un tag no declarado`);
      assert.ok(op.respuestas.some((r) => r.codigo.startsWith('2')), `${op.id} sin respuesta 2xx`);
    }
  });

  it('cada parametro de ruta del path esta declarado y viceversa', () => {
    for (const op of operaciones) {
      const enRuta = [...op.ruta.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      const declarados = op.parametros.filter((p) => p.en === 'path').map((p) => p.nombre).sort();
      assert.deepEqual(declarados, enRuta, `${op.metodo} ${op.ruta}`);
    }
  });

  it('las operaciones con body documentan 400 y 415, y las que reciben ids documentan 400 o 404', () => {
    for (const op of operaciones) {
      const codigos = op.respuestas.map((r) => r.codigo);
      if (op.cuerpo) {
        assert.ok(codigos.includes('400') && codigos.includes('415'), `${op.id} debe documentar 400 y 415`);
      }
      if (op.parametros.some((p) => p.en === 'path')) {
        assert.ok(codigos.includes('400') || codigos.includes('404'), `${op.id} debe documentar errores de id`);
      }
    }
  });

  it('todas las operaciones con body y las respuestas JSON traen ejemplo', () => {
    for (const op of operaciones) {
      if (op.cuerpo) assert.ok(op.cuerpo.ejemplo, `${op.id} sin ejemplo de body`);
      for (const r of op.respuestas.filter((x) => x.tipoContenido === 'application/json' && x.codigo !== '200')) {
        assert.ok(r.ejemplo, `${op.id} ${r.codigo} sin ejemplo`);
      }
    }
  });
});

describe('modelo de documentacion', () => {
  it('describe tipos, obligatoriedad y curl de una operacion', () => {
    const crear = operaciones.find((op) => op.id === 'crearEquipo');
    assert.equal(crear.metodo, 'POST');
    assert.deepEqual(crear.cuerpo.campos.map((c) => [c.nombre, c.requerido]), [['nombre', true], ['tag', true], ['region', true]]);
    assert.match(crear.cuerpo.campos[1].tipo, /^texto de 2 a 5 caracteres/);
    assert.equal(crear.cuerpo.campos[2].tipo, 'uno de: na, eu, latam, asia');
    assert.match(crear.curl, /^curl -X POST "http:\/\/localhost:3000\/intermedio\/ejercicio-27\/equipos" -H "Content-Type: application\/json" -d '\{/);
  });

  it('reemplaza los parametros de ruta por sus ejemplos en el curl', () => {
    const retirar = operaciones.find((op) => op.id === 'retirarEquipo');
    assert.match(retirar.curl, /torneos\/1\/inscripciones\/2"/);
    const listar = operaciones.find((op) => op.id === 'listarEquipos');
    assert.match(listar.curl, /equipos\?region=eu&buscar=wolves&orden=victorias"/);
  });
});

describe('renderizadores', () => {
  it('el HTML incluye cada operacion y es autocontenido', () => {
    const html = renderizarHtml(spec);
    assert.match(html, /^<!doctype html>/);
    for (const op of operaciones) {
      assert.ok(html.includes(`id="${op.id}"`), op.id);
    }
    assert.ok(!/<script/i.test(html));
    assert.ok(!/(src|href)="https?:/i.test(html));
  });

  it('el HTML escapa el contenido de la especificacion', () => {
    const maliciosa = structuredClone(spec);
    maliciosa.info.title = '<img src=x onerror=alert(1)>';
    maliciosa.paths['/equipos'].get.summary = '"><script>alert(1)</script>';
    const html = renderizarHtml(maliciosa);
    assert.ok(!html.includes('<img src=x'));
    assert.ok(!html.includes('<script>alert'));
    assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  });

  it('el Markdown tiene un titulo por operacion', () => {
    const markdown = renderizarMarkdown(spec);
    for (const op of operaciones) {
      assert.ok(markdown.includes(`### ${op.metodo} ${op.ruta}\n`), `${op.metodo} ${op.ruta}`);
    }
  });
});

describe('archivos generados', () => {
  for (const [nombre, contenido] of Object.entries(generarArchivos())) {
    it(`docs/${nombre} esta al dia (si falla: npm run docs:generar)`, () => {
      assert.equal(readFileSync(path.join(carpetaDocs, nombre), 'utf-8'), contenido);
    });
  }
});
