import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { aEsquemaJson } from '../src/docs/esquemaJson.js';
import { esquemaEquipo, esquemaEquipoCambios } from '../src/validators/schemas.js';

describe('conversion de esquemas de validacion a JSON Schema', () => {
  it('traduce cada regla a su tipo', () => {
    const esquema = aEsquemaJson({
      a: { tipo: 'texto', min: 2, max: 5, requerido: true, patron: /^[A-Z]+$/ },
      b: { tipo: 'entero', min: 1, max: 9, requerido: false, porDefecto: 3 },
      c: { tipo: 'enum', valores: ['x', 'y'], requerido: true, descripcion: 'Una opcion.' },
      d: { tipo: 'booleano' },
      e: { tipo: 'fecha' },
      f: { tipo: 'email' },
      g: { tipo: 'numero', min: 0, max: 1 },
    });

    assert.deepEqual(esquema.properties.a, { type: 'string', minLength: 2, maxLength: 5, pattern: '^[A-Z]+$' });
    assert.deepEqual(esquema.properties.b, { type: 'integer', minimum: 1, maximum: 9, default: 3 });
    assert.deepEqual(esquema.properties.c, { type: 'string', enum: ['x', 'y'], description: 'Una opcion.' });
    assert.deepEqual(esquema.properties.d, { type: 'boolean' });
    assert.deepEqual(esquema.properties.e, { type: 'string', format: 'date' });
    assert.equal(esquema.properties.f.format, 'email');
    assert.deepEqual(esquema.properties.g, { type: 'number', minimum: 0, maximum: 1 });
    assert.deepEqual(esquema.required, ['a', 'c']);
    assert.equal(esquema.additionalProperties, false);
  });

  it('en modo parcial no hay campos obligatorios pero exige al menos uno', () => {
    const esquema = aEsquemaJson(esquemaEquipoCambios, { parcial: true });
    assert.equal(esquema.required, undefined);
    assert.equal(esquema.minProperties, 1);
  });

  it('usa los mismos limites que la validacion real del equipo', () => {
    const esquema = aEsquemaJson(esquemaEquipo);
    assert.equal(esquema.properties.nombre.maxLength, esquemaEquipo.nombre.max);
    assert.equal(esquema.properties.tag.pattern, esquemaEquipo.tag.patron.source);
    assert.deepEqual(esquema.properties.region.enum, esquemaEquipo.region.valores);
    assert.deepEqual(esquema.required, ['nombre', 'tag', 'region']);
  });
});
