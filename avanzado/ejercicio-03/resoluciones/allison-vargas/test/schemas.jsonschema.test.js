import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { s } from '../src/schemas/index.js';
import { ESQUEMAS } from '../src/validators/index.js';

describe('exportacion a JSON Schema', () => {
  it('describe los tipos simples con sus limites', () => {
    assert.deepEqual(s.texto().min(2).max(9).patron(/^a+$/).aJsonSchema(), {
      type: 'string',
      minLength: 2,
      maxLength: 9,
      pattern: '^a+$',
    });
    assert.deepEqual(s.entero().min(1).max(5).aJsonSchema(), { type: 'integer', minimum: 1, maximum: 5 });
    assert.deepEqual(s.numero().aJsonSchema(), { type: 'number' });
    assert.deepEqual(s.booleano().aJsonSchema(), { type: 'boolean' });
    assert.deepEqual(s.texto().largo(4).aJsonSchema(), { type: 'string', minLength: 4, maxLength: 4 });
    assert.deepEqual(s.texto().email().aJsonSchema(), { type: 'string', format: 'email' });
    assert.deepEqual(s.fecha().aJsonSchema(), { type: 'string', format: 'date' });
    assert.deepEqual(s.fechaHora().aJsonSchema(), { type: 'string', format: 'date-time' });
    assert.deepEqual(s.literal('ban').aJsonSchema(), { const: 'ban' });
  });

  it('enumerado lista los valores', () => {
    assert.deepEqual(s.enumerado(['a', 'b']).aJsonSchema(), { type: 'string', enum: ['a', 'b'] });
    assert.deepEqual(s.enumerado([1, 2]).aJsonSchema(), { enum: [1, 2] });
  });

  it('arreglo describe items y largos', () => {
    assert.deepEqual(s.arreglo(s.texto()).min(1).max(3).aJsonSchema(), {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 3,
    });
    const fijo = s.arreglo(s.entero()).largo(4).aJsonSchema();
    assert.deepEqual([fijo.minItems, fijo.maxItems], [4, 4]);
  });

  it('objeto marca como requeridos solo los campos sin opcional ni defecto', () => {
    const esquema = s.objeto({
      a: s.texto(),
      b: s.texto().opcional(),
      c: s.entero().defecto(1),
      d: s.texto().nulo(),
    }).aJsonSchema();
    assert.deepEqual(esquema.required, ['a', 'd']);
    assert.equal(esquema.additionalProperties, false);
    assert.equal(esquema.properties.c.default, 1);
    assert.deepEqual(esquema.properties.d.type, ['string', 'null']);
    assert.equal(s.objeto({ a: s.texto() }).descartar().aJsonSchema().additionalProperties, true);
  });

  it('nulo agrega null al tipo, al enum y envuelve lo que no tiene tipo', () => {
    assert.deepEqual(s.enumerado(['a']).nulo().aJsonSchema(), { type: ['string', 'null'], enum: ['a', null] });
    assert.deepEqual(s.literal('x').nulo().aJsonSchema(), { anyOf: [{ const: 'x' }, { type: 'null' }] });
  });

  it('incluye descripciones y reglas que no se pueden expresar como tipo', () => {
    const esquema = s.objeto({ n: s.entero().describir('cantidad de rondas') })
      .refinar(() => true, { descripcion: 'regla cruzada' })
      .aJsonSchema();
    assert.equal(esquema.properties.n.description, 'cantidad de rondas');
    assert.deepEqual(esquema['x-reglas'], ['regla cruzada']);
    assert.deepEqual(s.arreglo(s.texto()).unico().aJsonSchema()['x-reglas'], ['elementos unicos']);
    assert.deepEqual(s.arreglo(s.texto()).unico((x) => x, 'nick').aJsonSchema()['x-reglas'], ['elementos unicos por nick']);
  });

  it('la union por discriminador se exporta como oneOf', () => {
    const esquema = s.unionPor('tipo', {
      a: s.objeto({ tipo: s.literal('a') }),
      b: s.objeto({ tipo: s.literal('b') }),
    }).aJsonSchema();
    assert.equal(esquema.oneOf.length, 2);
    assert.deepEqual(esquema.discriminator, { propertyName: 'tipo' });
  });

  it('todos los esquemas del dominio se pueden exportar y son serializables', () => {
    for (const [nombre, esquema] of Object.entries(ESQUEMAS)) {
      const json = esquema.aJsonSchema();
      assert.equal(json.type, 'object', nombre);
      assert.deepEqual(JSON.parse(JSON.stringify(json)), json, nombre);
    }
  });

  it('el schema de edicion no exige ningun campo', () => {
    assert.equal(ESQUEMAS['heroe-edicion'].aJsonSchema().required, undefined);
    assert.ok(ESQUEMAS.heroe.aJsonSchema().required.includes('nombre'));
  });
});
