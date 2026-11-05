import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantar } from '../soporte/cliente.js';

const espada = { nombre: 'Espada corta', tipo: 'arma' };

describe('rutas de inventario', () => {
  let cliente;

  beforeEach(async () => {
    cliente = await levantar();
  });

  afterEach(() => cliente.cerrar());

  it('lista el inventario con espacios y valor total', async () => {
    const { status, cuerpo } = await cliente.pedir('/personajes/1/inventario');
    assert.equal(status, 200);
    assert.equal(cuerpo.data.items.length, 2);
    assert.deepEqual(cuerpo.data.espacios, { usados: 2, maximo: 20 });
    assert.equal(cuerpo.data.valorTotal, 275);
  });

  it('devuelve un inventario vacio', async () => {
    const { cuerpo } = await cliente.pedir('/personajes/4/inventario');
    assert.deepEqual(cuerpo.data.items, []);
    assert.equal(cuerpo.data.valorTotal, 0);
  });

  it('responde 404 si el personaje no existe', async () => {
    const { status, cuerpo } = await cliente.pedir('/personajes/404/inventario');
    assert.equal(status, 404);
    assert.equal(cuerpo.codigo, 'PERSONAJE_NO_ENCONTRADO');
  });

  it('agrega un item con valores por defecto', async () => {
    const { status, cuerpo, cabeceras } = await cliente.json('/personajes/4/inventario', espada);
    assert.equal(status, 201);
    assert.equal(cuerpo.data.rareza, 'comun');
    assert.equal(cuerpo.data.valor, 0);
    assert.equal(cuerpo.data.cantidad, 1);
    assert.equal(cuerpo.data.personajeId, 4);
    assert.match(cabeceras.get('location'), /\/personajes\/4\/inventario\/7$/);
  });

  it('valida los campos del item', async () => {
    const { status, cuerpo } = await cliente.json('/personajes/4/inventario', {
      nombre: 'x',
      tipo: 'mascota',
      cantidad: 0,
      valor: -5,
      rareza: 'mitico',
    });
    assert.equal(status, 400);
    assert.deepEqual(cuerpo.errores.map((e) => e.campo), ['nombre', 'tipo', 'rareza', 'valor', 'cantidad']);
  });

  it('responde 409 cuando el inventario esta lleno', async () => {
    for (let i = 0; i < 18; i += 1) {
      const { status } = await cliente.json('/personajes/1/inventario', { ...espada, nombre: `Espada ${i + 10}` });
      assert.equal(status, 201);
    }
    const { status, cuerpo } = await cliente.json('/personajes/1/inventario', espada);
    assert.equal(status, 409);
    assert.equal(cuerpo.codigo, 'INVENTARIO_LLENO');
  });

  it('quita un item', async () => {
    const quitado = await cliente.pedir('/personajes/1/inventario/2', { method: 'DELETE' });
    assert.equal(quitado.status, 200);
    assert.equal(quitado.cuerpo.data.nombre, 'Pocion de vida');

    const { cuerpo } = await cliente.pedir('/personajes/1/inventario');
    assert.equal(cuerpo.data.items.length, 1);
  });

  it('responde 404 si el item no existe o es de otro personaje', async () => {
    const inexistente = await cliente.pedir('/personajes/1/inventario/999', { method: 'DELETE' });
    assert.equal(inexistente.status, 404);
    assert.equal(inexistente.cuerpo.codigo, 'ITEM_NO_ENCONTRADO');

    const ajeno = await cliente.pedir('/personajes/1/inventario/3', { method: 'DELETE' });
    assert.equal(ajeno.status, 404);
  });
});

describe('rutas de misiones', () => {
  let cliente;

  beforeEach(async () => {
    cliente = await levantar();
  });

  afterEach(() => cliente.cerrar());

  it('lista las misiones', async () => {
    const { status, cuerpo, cabeceras } = await cliente.pedir('/misiones');
    assert.equal(status, 200);
    assert.equal(cuerpo.data.length, 8);
    assert.equal(cabeceras.get('x-total-count'), '8');
  });

  it('filtra por dificultad y por nivel disponible', async () => {
    const epicas = await cliente.pedir('/misiones?dificultad=epica');
    assert.deepEqual(epicas.cuerpo.data.map((m) => m.id), [7, 8]);

    const disponibles = await cliente.pedir('/misiones?nivel=10');
    assert.deepEqual(disponibles.cuerpo.data.map((m) => m.id), [1, 2, 3, 4]);
  });

  it('ordena por recompensa de oro', async () => {
    const { cuerpo } = await cliente.pedir('/misiones?orden=oro&limite=2');
    assert.deepEqual(cuerpo.data.map((m) => m.id), [8, 7]);
  });

  it('rechaza filtros invalidos', async () => {
    const { status } = await cliente.pedir('/misiones?dificultad=imposible');
    assert.equal(status, 400);
  });

  it('devuelve una mision o 404', async () => {
    const existente = await cliente.pedir('/misiones/3');
    assert.equal(existente.status, 200);
    assert.equal(existente.cuerpo.data.titulo, 'Los lobos del bosque');

    const faltante = await cliente.pedir('/misiones/99');
    assert.equal(faltante.status, 404);
    assert.equal(faltante.cuerpo.codigo, 'MISION_NO_ENCONTRADA');
  });
});

describe('POST /personajes/:id/misiones/:misionId/completar', () => {
  let cliente;

  beforeEach(async () => {
    cliente = await levantar();
  });

  afterEach(() => cliente.cerrar());

  const completar = (personaje, mision) =>
    cliente.pedir(`/personajes/${personaje}/misiones/${mision}/completar`, { method: 'POST' });

  it('aplica experiencia y oro sin subir de nivel', async () => {
    const { status, cuerpo } = await completar(4, 3);
    assert.equal(status, 200);
    assert.deepEqual(cuerpo.data.recompensa, { xp: 250, oro: 150 });
    assert.equal(cuerpo.data.nivelesGanados, 0);
    assert.equal(cuerpo.data.personaje.experiencia, 340);
    assert.equal(cuerpo.data.personaje.oro, 360);
    assert.deepEqual(cuerpo.data.personaje.misionesCompletadas, [3]);
  });

  it('sube de nivel y recalcula vida y mana', async () => {
    const { cuerpo } = await completar(5, 5);
    assert.equal(cuerpo.data.nivelesGanados, 1);
    assert.equal(cuerpo.data.personaje.nivel, 21);
    assert.equal(cuerpo.data.personaje.experiencia, 300);
    assert.equal(cuerpo.data.personaje.vida, 210);
    assert.equal(cuerpo.data.personaje.mana, 90);
    assert.equal(cuerpo.data.personaje.oro, 9600);
  });

  it('el cambio queda guardado', async () => {
    await completar(4, 3);
    const { cuerpo } = await cliente.pedir('/personajes/4');
    assert.deepEqual(cuerpo.data.misionesCompletadas, [3]);
  });

  it('responde 409 si la mision ya estaba completada', async () => {
    await completar(4, 3);
    const { status, cuerpo } = await completar(4, 3);
    assert.equal(status, 409);
    assert.equal(cuerpo.codigo, 'MISION_YA_COMPLETADA');
  });

  it('responde 422 si el nivel no alcanza', async () => {
    const { status, cuerpo } = await completar(4, 4);
    assert.equal(status, 422);
    assert.equal(cuerpo.codigo, 'NIVEL_INSUFICIENTE');
  });

  it('responde 404 si falta el personaje o la mision', async () => {
    assert.equal((await completar(404, 1)).cuerpo.codigo, 'PERSONAJE_NO_ENCONTRADO');
    assert.equal((await completar(4, 99)).cuerpo.codigo, 'MISION_NO_ENCONTRADA');
  });
});
