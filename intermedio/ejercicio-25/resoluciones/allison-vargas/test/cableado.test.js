import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { levantar } from '../soporte/cliente.js';
import { NotFoundError } from '../src/utils/errors.js';

const pagina = { data: [], paginacion: { pagina: 1, limite: 10, total: 0, totalPaginas: 1 } };

function crearStubs() {
  return {
    personajes: {
      listar: mock.fn(() => pagina),
      ranking: mock.fn(() => pagina),
      obtener: mock.fn((id) => ({ id })),
      crear: mock.fn((datos) => ({ id: 7, ...datos })),
      renombrar: mock.fn((id, datos) => ({ id, ...datos })),
      eliminar: mock.fn((id) => ({ id })),
    },
    inventario: {
      listar: mock.fn((id) => ({ personajeId: id, items: [] })),
      agregar: mock.fn((id, datos) => ({ id: 3, personajeId: id, ...datos })),
      quitar: mock.fn((id, itemId) => ({ id: itemId, personajeId: id })),
    },
    misiones: {
      listar: mock.fn(() => pagina),
      obtener: mock.fn((id) => ({ id })),
      completar: mock.fn((personajeId, misionId) => ({ personaje: { id: personajeId }, recompensa: { xp: misionId, oro: 0 }, nivelesGanados: 0 })),
    },
  };
}

const argumentos = (funcion, llamada = 0) => funcion.mock.calls[llamada].arguments;

describe('cableado de rutas con servicios simulados', () => {
  let stubs;
  let cliente;

  beforeEach(async () => {
    stubs = crearStubs();
    cliente = await levantar(crearApp(stubs));
  });

  afterEach(() => cliente.cerrar());

  describe('personajes', () => {
    it('GET /personajes pasa la consulta tal cual al servicio', async () => {
      const { status } = await cliente.pedir('/personajes?clase=mago&pagina=2');
      assert.equal(status, 200);
      assert.equal(stubs.personajes.listar.mock.callCount(), 1);
      assert.deepEqual({ ...argumentos(stubs.personajes.listar)[0] }, { clase: 'mago', pagina: '2' });
    });

    it('GET /personajes/:id convierte el id a numero', async () => {
      await cliente.pedir('/personajes/42');
      assert.deepEqual(argumentos(stubs.personajes.obtener), [42]);
    });

    it('un id invalido no llega al servicio', async () => {
      const { status } = await cliente.pedir('/personajes/abc');
      assert.equal(status, 400);
      assert.equal(stubs.personajes.obtener.mock.callCount(), 0);
    });

    it('GET /personajes/ranking llama a ranking y no a obtener', async () => {
      await cliente.pedir('/personajes/ranking');
      assert.equal(stubs.personajes.ranking.mock.callCount(), 1);
      assert.equal(stubs.personajes.obtener.mock.callCount(), 0);
    });

    it('POST /personajes entrega el body ya limpio', async () => {
      const { status, cabeceras } = await cliente.json('/personajes', { nombre: ' Nova ', clase: 'mago' });
      assert.equal(status, 201);
      assert.deepEqual(argumentos(stubs.personajes.crear), [{ nombre: 'Nova', clase: 'mago' }]);
      assert.match(cabeceras.get('location'), /\/personajes\/7$/);
    });

    it('un body invalido no llega al servicio', async () => {
      const { status } = await cliente.json('/personajes', { nombre: 'Nova' });
      assert.equal(status, 400);
      assert.equal(stubs.personajes.crear.mock.callCount(), 0);
    });

    it('un Content-Type incorrecto no llega al servicio', async () => {
      const { status } = await cliente.pedir('/personajes', {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: '{"nombre":"Nova","clase":"mago"}',
      });
      assert.equal(status, 415);
      assert.equal(stubs.personajes.crear.mock.callCount(), 0);
    });

    it('PATCH /personajes/:id llama a renombrar con id y body', async () => {
      await cliente.json('/personajes/5', { nombre: 'Lyra' }, 'PATCH');
      assert.deepEqual(argumentos(stubs.personajes.renombrar), [5, { nombre: 'Lyra' }]);
    });

    it('DELETE /personajes/:id llama a eliminar', async () => {
      await cliente.pedir('/personajes/5', { method: 'DELETE' });
      assert.deepEqual(argumentos(stubs.personajes.eliminar), [5]);
    });
  });

  describe('inventario', () => {
    it('GET /personajes/:id/inventario', async () => {
      await cliente.pedir('/personajes/3/inventario');
      assert.deepEqual(argumentos(stubs.inventario.listar), [3]);
    });

    it('POST completa los valores por defecto antes de llamar al servicio', async () => {
      const { status, cabeceras } = await cliente.json('/personajes/3/inventario', { nombre: 'Escudo', tipo: 'armadura' });
      assert.equal(status, 201);
      assert.deepEqual(argumentos(stubs.inventario.agregar), [3, { nombre: 'Escudo', tipo: 'armadura', rareza: 'comun', valor: 0, cantidad: 1 }]);
      assert.match(cabeceras.get('location'), /\/personajes\/3\/inventario\/3$/);
    });

    it('DELETE /personajes/:id/inventario/:itemId', async () => {
      await cliente.pedir('/personajes/3/inventario/9', { method: 'DELETE' });
      assert.deepEqual(argumentos(stubs.inventario.quitar), [3, 9]);
    });
  });

  describe('misiones', () => {
    it('GET /misiones y GET /misiones/:id', async () => {
      await cliente.pedir('/misiones?dificultad=facil');
      assert.deepEqual({ ...argumentos(stubs.misiones.listar)[0] }, { dificultad: 'facil' });
      await cliente.pedir('/misiones/6');
      assert.deepEqual(argumentos(stubs.misiones.obtener), [6]);
    });

    it('POST completar pasa personaje y mision', async () => {
      const { status, cuerpo } = await cliente.pedir('/personajes/2/misiones/4/completar', { method: 'POST' });
      assert.equal(status, 200);
      assert.deepEqual(argumentos(stubs.misiones.completar), [2, 4]);
      assert.equal(cuerpo.data.recompensa.xp, 4);
    });
  });

  describe('errores del servicio', () => {
    it('un error de la aplicacion conserva su status y codigo', async () => {
      stubs.personajes.obtener.mock.mockImplementation(() => {
        throw new NotFoundError('No existe', 'PERSONAJE_NO_ENCONTRADO');
      });
      const { status, cuerpo } = await cliente.pedir('/personajes/1');
      assert.equal(status, 404);
      assert.deepEqual(cuerpo, { ok: false, message: 'No existe', codigo: 'PERSONAJE_NO_ENCONTRADO' });
    });

    it('un error inesperado responde 500 sin filtrar detalles', async () => {
      const silencio = mock.method(console, 'error', () => {});
      stubs.personajes.obtener.mock.mockImplementation(() => {
        throw new Error('fallo interno con datos sensibles');
      });
      const { status, cuerpo } = await cliente.pedir('/personajes/1');
      silencio.mock.restore();
      assert.equal(status, 500);
      assert.equal(cuerpo.codigo, 'ERROR_INTERNO');
      assert.ok(!JSON.stringify(cuerpo).includes('sensibles'));
    });
  });
});
