import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantar } from '../soporte/cliente.js';

describe('rutas de personajes', () => {
  let cliente;

  beforeEach(async () => {
    cliente = await levantar();
  });

  afterEach(() => cliente.cerrar());

  describe('GET /personajes', () => {
    it('lista con paginacion y header de total', async () => {
      const { status, cuerpo, cabeceras } = await cliente.pedir('/personajes');
      assert.equal(status, 200);
      assert.equal(cuerpo.ok, true);
      assert.equal(cuerpo.data.length, 5);
      assert.deepEqual(cuerpo.paginacion, { pagina: 1, limite: 10, total: 5, totalPaginas: 1 });
      assert.equal(cabeceras.get('x-total-count'), '5');
    });

    it('filtra por clase', async () => {
      const { cuerpo } = await cliente.pedir('/personajes?clase=mago');
      assert.deepEqual(cuerpo.data.map((p) => p.nombre), ['Elara']);
    });

    it('filtra por nivel minimo', async () => {
      const { cuerpo } = await cliente.pedir('/personajes?nivelMin=15');
      assert.deepEqual(cuerpo.data.map((p) => p.nombre), ['Elara', 'Kael']);
    });

    it('busca por texto sin distinguir mayusculas', async () => {
      const { cuerpo } = await cliente.pedir('/personajes?buscar=THO');
      assert.deepEqual(cuerpo.data.map((p) => p.nombre), ['Thorin']);
    });

    it('ordena por nivel descendente', async () => {
      const { cuerpo } = await cliente.pedir('/personajes?orden=nivel');
      assert.deepEqual(cuerpo.data.map((p) => p.nivel), [20, 15, 12, 8, 5]);
    });

    it('pagina los resultados', async () => {
      const { cuerpo } = await cliente.pedir('/personajes?pagina=2&limite=2');
      assert.deepEqual(cuerpo.data.map((p) => p.id), [3, 4]);
      assert.equal(cuerpo.paginacion.totalPaginas, 3);
    });

    it('rechaza valores fuera de rango', async () => {
      for (const consulta of ['limite=51', 'pagina=0', 'clase=bardo', 'nivelMin=99', 'orden=poder']) {
        const { status, cuerpo } = await cliente.pedir(`/personajes?${consulta}`);
        assert.equal(status, 400, consulta);
        assert.equal(cuerpo.codigo, 'CONSULTA_INVALIDA');
      }
    });
  });

  describe('GET /personajes/ranking', () => {
    it('ordena por nivel y experiencia', async () => {
      const { cuerpo } = await cliente.pedir('/personajes/ranking');
      assert.deepEqual(cuerpo.data.map((p) => p.nombre), ['Kael', 'Elara', 'Thorin', 'Sylas', 'Mirabel']);
    });

    it('respeta el limite y su tope de 10', async () => {
      const corto = await cliente.pedir('/personajes/ranking?limite=3');
      assert.equal(corto.cuerpo.data.length, 3);
      const largo = await cliente.pedir('/personajes/ranking?limite=11');
      assert.equal(largo.status, 400);
    });
  });

  describe('GET /personajes/:id', () => {
    it('devuelve el personaje', async () => {
      const { status, cuerpo } = await cliente.pedir('/personajes/1');
      assert.equal(status, 200);
      assert.equal(cuerpo.data.nombre, 'Thorin');
      assert.equal(cuerpo.data.clase, 'guerrero');
    });

    it('responde 404 si no existe', async () => {
      const { status, cuerpo } = await cliente.pedir('/personajes/404');
      assert.equal(status, 404);
      assert.equal(cuerpo.codigo, 'PERSONAJE_NO_ENCONTRADO');
    });
  });

  describe('POST /personajes', () => {
    it('crea un personaje con estadisticas de su clase', async () => {
      const { status, cuerpo, cabeceras } = await cliente.json('/personajes', { nombre: '  Nova  ', clase: 'mago' });
      assert.equal(status, 201);
      assert.equal(cuerpo.data.nombre, 'Nova');
      assert.equal(cuerpo.data.nivel, 1);
      assert.equal(cuerpo.data.vida, 60);
      assert.equal(cuerpo.data.mana, 100);
      assert.equal(cuerpo.data.oro, 100);
      assert.deepEqual(cuerpo.data.misionesCompletadas, []);
      assert.match(cabeceras.get('location'), /\/intermedio\/ejercicio-25\/personajes\/6$/);

      const leido = await cliente.absoluta(cabeceras.get('location'));
      assert.equal(leido.status, 200);
      assert.equal(leido.cuerpo.data.nombre, 'Nova');
    });

    it('lista todos los campos que faltan', async () => {
      const { status, cuerpo } = await cliente.json('/personajes', {});
      assert.equal(status, 400);
      assert.deepEqual(cuerpo.errores.map((e) => e.campo), ['nombre', 'clase']);
    });

    it('rechaza campos no permitidos', async () => {
      const { status, cuerpo } = await cliente.json('/personajes', { nombre: 'Nova', clase: 'mago', nivel: 50 });
      assert.equal(status, 400);
      assert.deepEqual(cuerpo.errores, [{ campo: 'nivel', mensaje: 'campo no permitido' }]);
    });

    it('rechaza nombre corto y clase desconocida', async () => {
      const { cuerpo } = await cliente.json('/personajes', { nombre: 'ab', clase: 'bardo' });
      assert.deepEqual(cuerpo.errores.map((e) => e.campo), ['nombre', 'clase']);
    });

    it('responde 409 si el nombre ya existe sin importar mayusculas', async () => {
      const { status, cuerpo } = await cliente.json('/personajes', { nombre: 'THORIN', clase: 'picaro' });
      assert.equal(status, 409);
      assert.equal(cuerpo.codigo, 'NOMBRE_DUPLICADO');
    });
  });

  describe('PATCH /personajes/:id', () => {
    it('renombra al personaje', async () => {
      const { status, cuerpo } = await cliente.json('/personajes/4', { nombre: 'Lyra' }, 'PATCH');
      assert.equal(status, 200);
      assert.equal(cuerpo.data.nombre, 'Lyra');
      assert.equal(cuerpo.data.clase, 'clerigo');
    });

    it('permite conservar su propio nombre', async () => {
      const { status } = await cliente.json('/personajes/4', { nombre: 'mirabel' }, 'PATCH');
      assert.equal(status, 200);
    });

    it('responde 409 si el nombre es de otro personaje', async () => {
      const { status } = await cliente.json('/personajes/4', { nombre: 'Kael' }, 'PATCH');
      assert.equal(status, 409);
    });

    it('rechaza body vacio y campos que no se pueden cambiar', async () => {
      const vacio = await cliente.json('/personajes/4', {}, 'PATCH');
      assert.equal(vacio.status, 400);
      const clase = await cliente.json('/personajes/4', { clase: 'mago' }, 'PATCH');
      assert.equal(clase.status, 400);
    });

    it('responde 404 si el personaje no existe', async () => {
      const { status } = await cliente.json('/personajes/404', { nombre: 'Lyra' }, 'PATCH');
      assert.equal(status, 404);
    });
  });

  describe('DELETE /personajes/:id', () => {
    it('elimina al personaje y su inventario', async () => {
      const borrado = await cliente.pedir('/personajes/1', { method: 'DELETE' });
      assert.equal(borrado.status, 200);
      assert.equal(borrado.cuerpo.data.nombre, 'Thorin');

      assert.equal((await cliente.pedir('/personajes/1')).status, 404);
      assert.equal((await cliente.pedir('/personajes/1/inventario')).status, 404);
      assert.equal((await cliente.pedir('/personajes')).cuerpo.paginacion.total, 4);
    });

    it('responde 404 al borrar dos veces', async () => {
      await cliente.pedir('/personajes/2', { method: 'DELETE' });
      const { status } = await cliente.pedir('/personajes/2', { method: 'DELETE' });
      assert.equal(status, 404);
    });
  });
});
