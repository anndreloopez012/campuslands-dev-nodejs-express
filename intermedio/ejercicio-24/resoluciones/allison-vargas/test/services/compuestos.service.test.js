import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { crearCompuestosService } from '../../src/services/compuestos.service.js';
import { ValidationError } from '../../src/utils/errors.js';

const semilla = [
  { id: 1, nombre: 'Agua', formula: 'H2O', categoria: 'otro', masaMolar: 18, creadoEn: '2026-01-01T00:00:00.000Z' },
  { id: 2, nombre: 'Cloruro de sodio', formula: 'NaCl', categoria: 'sal', masaMolar: 58.5, creadoEn: '2026-01-02T00:00:00.000Z' },
  { id: 3, nombre: 'Hidroxido de sodio', formula: 'NaOH', categoria: 'base', masaMolar: 40, creadoEn: '2026-01-03T00:00:00.000Z' },
  { id: 4, nombre: 'Glucosa', formula: 'C6H12O6', categoria: 'organico', masaMolar: 180, creadoEn: '2026-01-04T00:00:00.000Z' },
];

function crearRepositorioFalso(iniciales) {
  const items = iniciales.map((item) => ({ ...item }));
  let siguiente = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  return {
    listar: mock.fn((predicado = () => true) => items.filter(predicado).map((item) => ({ ...item }))),
    buscar: mock.fn((id) => {
      const encontrado = items.find((item) => item.id === id);
      return encontrado ? { ...encontrado } : null;
    }),
    crear: mock.fn((datos) => {
      const nuevo = { id: siguiente++, ...datos };
      items.push(nuevo);
      return { ...nuevo };
    }),
    eliminar: mock.fn((id) => {
      const indice = items.findIndex((item) => item.id === id);
      if (indice === -1) return false;
      items.splice(indice, 1);
      return true;
    }),
  };
}

const AHORA = new Date('2026-03-10T15:30:00.000Z');

describe('compuestos.service', () => {
  let repositorio;
  let formulas;
  let servicio;

  beforeEach(() => {
    repositorio = crearRepositorioFalso(semilla);
    formulas = { masaMolar: mock.fn(() => 16) };
    servicio = crearCompuestosService({ repositorio, formulas, reloj: () => AHORA });
  });

  describe('crear', () => {
    it('calcula la masa con el servicio de formulas y guarda con la fecha del reloj', () => {
      const creado = servicio.crear({ nombre: 'Metano', formula: 'CH4', categoria: 'organico' });

      assert.equal(formulas.masaMolar.mock.callCount(), 1);
      assert.deepEqual(formulas.masaMolar.mock.calls[0].arguments, ['CH4']);
      assert.deepEqual(repositorio.crear.mock.calls[0].arguments[0], {
        nombre: 'Metano',
        formula: 'CH4',
        categoria: 'organico',
        masaMolar: 16,
        creadoEn: '2026-03-10T15:30:00.000Z',
      });
      assert.equal(creado.id, 5);
    });

    it('usa la hora actual si no se inyecta un reloj', () => {
      const real = crearCompuestosService({ repositorio, formulas });
      const antes = Date.now();
      const creado = real.crear({ nombre: 'Metano', formula: 'CH4', categoria: 'organico' });
      const momento = Date.parse(creado.creadoEn);
      assert.ok(momento >= antes && momento <= Date.now());
    });

    it('no guarda nada si la formula es invalida', () => {
      formulas.masaMolar.mock.mockImplementation(() => {
        throw new ValidationError('Formula invalida', [{ campo: 'formula', mensaje: 'falta cerrar' }], 'FORMULA_INVALIDA');
      });

      assert.throws(() => servicio.crear({ nombre: 'Raro', formula: 'Ca(OH', categoria: 'otro' }), { codigo: 'FORMULA_INVALIDA' });
      assert.equal(repositorio.crear.mock.callCount(), 0);
    });

    it('responde 409 si la formula ya esta registrada', () => {
      assert.throws(
        () => servicio.crear({ nombre: 'Otro nombre', formula: 'H2O', categoria: 'otro' }),
        { statusCode: 409, codigo: 'FORMULA_DUPLICADA' },
      );
      assert.equal(repositorio.crear.mock.callCount(), 0);
    });

    it('responde 409 si el nombre ya existe, sin importar mayusculas', () => {
      assert.throws(
        () => servicio.crear({ nombre: 'AGUA', formula: 'H2O2', categoria: 'otro' }),
        { statusCode: 409, codigo: 'NOMBRE_DUPLICADO' },
      );
      assert.equal(repositorio.crear.mock.callCount(), 0);
    });
  });

  describe('obtener', () => {
    it('devuelve el compuesto pedido', () => {
      assert.equal(servicio.obtener(2).nombre, 'Cloruro de sodio');
      assert.deepEqual(repositorio.buscar.mock.calls[0].arguments, [2]);
    });

    it('responde 404 si no existe', () => {
      assert.throws(() => servicio.obtener(99), { statusCode: 404, codigo: 'COMPUESTO_NO_ENCONTRADO' });
    });
  });

  describe('listar', () => {
    it('devuelve todo con la paginacion por defecto', () => {
      const { data, paginacion } = servicio.listar({});
      assert.deepEqual(data.map((item) => item.id), [1, 2, 3, 4]);
      assert.deepEqual(paginacion, { pagina: 1, limite: 10, total: 4, totalPaginas: 1 });
    });

    it('filtra por categoria', () => {
      const { data } = servicio.listar({ categoria: 'sal' });
      assert.deepEqual(data.map((item) => item.formula), ['NaCl']);
    });

    it('busca en nombre y formula sin importar mayusculas', () => {
      assert.deepEqual(servicio.listar({ buscar: 'SODIO' }).data.map((item) => item.id), [2, 3]);
      assert.deepEqual(servicio.listar({ buscar: 'c6h12' }).data.map((item) => item.id), [4]);
    });

    it('ordena por masa molar ascendente', () => {
      const { data } = servicio.listar({ orden: 'masa' });
      assert.deepEqual(data.map((item) => item.masaMolar), [18, 40, 58.5, 180]);
    });

    it('pagina el resultado', () => {
      const { data, paginacion } = servicio.listar({ limite: '3', pagina: '2' });
      assert.deepEqual(data.map((item) => item.id), [4]);
      assert.equal(paginacion.totalPaginas, 2);
    });

    it('rechaza una categoria que no existe', () => {
      assert.throws(() => servicio.listar({ categoria: 'metal' }), { statusCode: 400, codigo: 'CONSULTA_INVALIDA' });
    });
  });

  describe('eliminar', () => {
    it('borra y devuelve el compuesto', () => {
      const eliminado = servicio.eliminar(3);
      assert.equal(eliminado.formula, 'NaOH');
      assert.deepEqual(repositorio.eliminar.mock.calls[0].arguments, [3]);
      assert.throws(() => servicio.obtener(3), { statusCode: 404 });
    });

    it('responde 404 sin borrar nada si no existe', () => {
      assert.throws(() => servicio.eliminar(99), { statusCode: 404 });
      assert.equal(repositorio.eliminar.mock.callCount(), 0);
    });
  });
});
