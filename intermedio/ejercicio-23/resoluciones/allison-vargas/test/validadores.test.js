import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validarCuerpo } from '../src/validators/esquema.js';
import { validarId } from '../src/validators/id.validator.js';
import { esquemaCalculo, esquemaProcedimiento } from '../src/validators/schemas.js';
import { ValidationError } from '../src/utils/errors.js';

const cuerpoValido = { proceso: 'mig', material: 'acero_carbono', voltaje: 24, amperaje: 200, velocidadMmMin: 300 };

const camposConError = (accion) => {
  try {
    accion();
  } catch (error) {
    assert.ok(error instanceof ValidationError);
    return error.detalles.map((item) => item.campo);
  }
  assert.fail('se esperaba un ValidationError');
  return [];
};

describe('esquemaCalculo', () => {
  it('acepta un cuerpo completo', () => {
    assert.deepEqual(validarCuerpo(cuerpoValido, esquemaCalculo), cuerpoValido);
  });

  it('rechaza campos que no estan en el esquema', () => {
    const campos = camposConError(() => validarCuerpo({ ...cuerpoValido, extra: 'x' }, esquemaCalculo));
    assert.deepEqual(campos, ['extra']);
  });

  it('reporta todos los campos faltantes', () => {
    const campos = camposConError(() => validarCuerpo({}, esquemaCalculo));
    assert.deepEqual(campos, ['proceso', 'material', 'voltaje', 'amperaje', 'velocidadMmMin']);
  });

  it('rechaza numeros enviados como texto', () => {
    const campos = camposConError(() => validarCuerpo({ ...cuerpoValido, voltaje: '24' }, esquemaCalculo));
    assert.deepEqual(campos, ['voltaje']);
  });

  it('rechaza decimales en campos enteros', () => {
    const campos = camposConError(() => validarCuerpo({ ...cuerpoValido, amperaje: 200.5 }, esquemaCalculo));
    assert.deepEqual(campos, ['amperaje']);
  });

  it('rechaza un proceso que no existe', () => {
    const campos = camposConError(() => validarCuerpo({ ...cuerpoValido, proceso: 'laser' }, esquemaCalculo));
    assert.deepEqual(campos, ['proceso']);
  });

  it('rechaza velocidades fuera de 50 a 2000', () => {
    assert.deepEqual(camposConError(() => validarCuerpo({ ...cuerpoValido, velocidadMmMin: 10 }, esquemaCalculo)), ['velocidadMmMin']);
    assert.deepEqual(camposConError(() => validarCuerpo({ ...cuerpoValido, velocidadMmMin: 5000 }, esquemaCalculo)), ['velocidadMmMin']);
  });

  it('rechaza un body que no es un objeto', () => {
    assert.throws(() => validarCuerpo(null, esquemaCalculo), ValidationError);
    assert.throws(() => validarCuerpo([], esquemaCalculo), ValidationError);
  });
});

describe('esquemaProcedimiento', () => {
  it('exige espesor y soldador ademas de los parametros', () => {
    const campos = camposConError(() => validarCuerpo(cuerpoValido, esquemaProcedimiento));
    assert.deepEqual(campos, ['espesorMm', 'soldador']);
  });

  it('recorta los espacios del nombre del soldador', () => {
    const limpio = validarCuerpo({ ...cuerpoValido, espesorMm: 8, soldador: '  Ana Ruiz  ' }, esquemaProcedimiento);
    assert.equal(limpio.soldador, 'Ana Ruiz');
  });
});

describe('validarId', () => {
  it('convierte un id valido en numero', () => {
    assert.equal(validarId('12'), 12);
  });

  for (const invalido of ['abc', '0', '-3', '1.5', '']) {
    it(`rechaza "${invalido}"`, () => {
      assert.throws(() => validarId(invalido), ValidationError);
    });
  }
});
