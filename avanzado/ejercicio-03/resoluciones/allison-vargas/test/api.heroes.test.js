import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi, AHORA } from '../soporte/api.js';
import { heroeValido } from '../soporte/datos.js';

describe('API de heroes: consulta', () => {
  let api;

  beforeEach(async () => {
    api = await levantarApi();
  });

  afterEach(() => api.cerrar());

  const nombres = async (consulta) => (await api.pedir(`/heroes${consulta}`)).cuerpo.data.map((h) => h.nombre);

  it('lista con paginacion por defecto', async () => {
    const { status, cabeceras, cuerpo } = await api.pedir('/heroes');
    assert.equal(status, 200);
    assert.equal(cabeceras.get('x-total-count'), '10');
    assert.deepEqual(cuerpo.paginacion, { pagina: 1, limite: 10, total: 10, totalPaginas: 1 });
    assert.equal(cuerpo.data[0].nombre, 'Aegis');
  });

  it('convierte los parametros de texto a los tipos del schema', async () => {
    assert.deepEqual(await nombres('?dificultad=5'), ['Dusk', 'Kestrel']);
    assert.deepEqual(await nombres('?rol=tanque'), ['Aegis', 'Ironclad']);
    assert.deepEqual(await nombres('?rol=soporte&dificultad=3'), ['Halo']);
    assert.deepEqual(await nombres('?buscar=E'), ['Aegis', 'Cinder', 'Ember', 'Fable', 'Gale', 'Kestrel']);
  });

  it('ordena y pagina', async () => {
    assert.deepEqual(await nombres('?orden=nombre&limite=3&pagina=2'), ['Dusk', 'Ember', 'Fable']);
    assert.deepEqual(await nombres('?orden=dificultad_desc&limite=3'), ['Dusk', 'Kestrel', 'Bruma']);
    assert.deepEqual(await nombres('?orden=dificultad&limite=2'), ['Ironclad', 'Aegis']);
  });

  it('devuelve todos los errores de la consulta juntos, indicando su origen', async () => {
    const { status, cuerpo } = await api.pedir('/heroes?rol=bardo&dificultad=9&limite=0&pagina=x&extra=1');
    assert.equal(status, 400);
    assert.equal(cuerpo.codigo, 'VALIDACION');
    assert.deepEqual(cuerpo.errores.map((e) => `${e.en}:${e.ruta}:${e.codigo}`), [
      'consulta:rol:enum_invalido',
      'consulta:dificultad:muy_grande',
      'consulta:pagina:tipo_invalido',
      'consulta:limite:muy_pequeno',
      'consulta:extra:campo_desconocido',
    ]);
  });

  it('es estricta con los numeros en texto y los parametros repetidos', async () => {
    for (const consulta of ['dificultad=007', 'dificultad=1e1', 'dificultad=', 'dificultad=%202', 'limite=2.5', 'rol=tanque&rol=mago', 'buscar=']) {
      const { status } = await api.pedir(`/heroes?${consulta}`);
      assert.equal(status, 400, consulta);
    }
  });

  it('consulta un heroe por id', async () => {
    const { cuerpo } = await api.pedir('/heroes/3');
    assert.equal(cuerpo.data.nombre, 'Cinder');
    assert.equal(cuerpo.data.habilidades.length, 4);
  });

  it('valida el id de la ruta y responde 404 si no existe', async () => {
    const faltante = await api.pedir('/heroes/99');
    assert.deepEqual([faltante.status, faltante.cuerpo.codigo], [404, 'HEROE_NO_ENCONTRADO']);
    for (const id of ['abc', '0', '-1', '1.5', '007', '99999999999']) {
      const { status, cuerpo } = await api.pedir(`/heroes/${id}`);
      assert.equal(status, 400, id);
      assert.equal(cuerpo.errores[0].en, 'parametros');
      assert.equal(cuerpo.errores[0].ruta, 'id');
    }
  });
});

describe('API de heroes: escritura', () => {
  let api;

  beforeEach(async () => {
    api = await levantarApi();
  });

  afterEach(() => api.cerrar());

  it('crea un heroe con los datos normalizados por el schema', async () => {
    const { status, cabeceras, cuerpo } = await api.json('/heroes', heroeValido());
    assert.equal(status, 201);
    assert.equal(cabeceras.get('location'), '/avanzado/ejercicio-03/heroes/11');
    assert.equal(cuerpo.data.id, 11);
    assert.equal(cuerpo.data.nombre, 'Rayo Veloz');
    assert.deepEqual(cuerpo.data.etiquetas, ['rapido', 'agil']);
    assert.equal(cuerpo.data.estadisticas.mana, 0);
    assert.equal(cuerpo.data.creadoEn, AHORA.toISOString());
    assert.equal((await api.pedir('/heroes/11')).status, 200);
  });

  it('devuelve todos los errores del cuerpo con su ruta exacta', async () => {
    const habilidades = heroeValido().habilidades;
    habilidades[2].tecla = 'Q';
    const cuerpoInvalido = heroeValido({ nombre: 'x', rol: 'tanque', habilidades, etiquetas: 'rapido', extra: 1 });
    const { status, cuerpo } = await api.json('/heroes', cuerpoInvalido);
    assert.equal(status, 400);
    assert.deepEqual(cuerpo.errores, [
      { en: 'cuerpo', ruta: 'nombre', codigo: 'muy_corto', mensaje: 'debe tener al menos 2 caracteres' },
      { en: 'cuerpo', ruta: 'habilidades[2].tecla', codigo: 'duplicado', mensaje: 'ya aparece en la posicion 0' },
      { en: 'cuerpo', ruta: 'etiquetas', codigo: 'tipo_invalido', mensaje: 'debe ser un arreglo, se recibio texto' },
      { en: 'cuerpo', ruta: 'extra', codigo: 'campo_desconocido', mensaje: 'campo no permitido' },
    ]);
  });

  it('aplica las reglas cruzadas del schema', async () => {
    const tanque = heroeValido({ rol: 'tanque' });
    const { status, cuerpo } = await api.json('/heroes', tanque);
    assert.equal(status, 400);
    assert.deepEqual(cuerpo.errores.map((e) => `${e.ruta}:${e.codigo}`), ['estadisticas.armadura:tanque_sin_armadura']);
  });

  it('no repite nombres', async () => {
    const { status, cuerpo } = await api.json('/heroes', heroeValido({ nombre: 'aegis' }));
    assert.deepEqual([status, cuerpo.codigo], [409, 'NOMBRE_DUPLICADO']);
  });

  it('rechaza cuerpos que no son objetos', async () => {
    for (const cuerpo of [[], [heroeValido()]]) {
      const { status, cuerpo: respuesta } = await api.json('/heroes', cuerpo);
      assert.equal(status, 400);
      assert.deepEqual(respuesta.errores.map((e) => `${e.ruta}:${e.codigo}`), ['$:tipo_invalido']);
    }
    const vacio = await api.json('/heroes', {});
    assert.equal(vacio.status, 400);
    assert.ok(vacio.cuerpo.errores.every((e) => e.codigo === 'requerido' || e.codigo === 'largo_invalido'));
  });

  it('exige JSON, tolera JSON roto y limita el tamano', async () => {
    const tipo = await api.pedir('/heroes', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' });
    assert.deepEqual([tipo.status, tipo.cuerpo.codigo], [415, 'TIPO_NO_SOPORTADO']);
    const roto = await api.pedir('/heroes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"nombre":' });
    assert.deepEqual([roto.status, roto.cuerpo.codigo], [400, 'JSON_INVALIDO']);
    const grande = await api.json('/heroes', heroeValido({ nombre: 'x'.repeat(20000) }));
    assert.equal(grande.status, 413);
  });

  it('no permite __proto__ en el cuerpo', async () => {
    const respuesta = await api.pedir('/heroes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(heroeValido()).replace('{', '{"__proto__":{"admin":true},'),
    });
    assert.equal(respuesta.status, 400);
    assert.ok(respuesta.cuerpo.errores.some((e) => e.ruta === '__proto__' && e.codigo === 'campo_desconocido'));
    assert.equal({}.admin, undefined);
  });

  it('PATCH actualiza solo lo enviado y conserva el resto', async () => {
    const { status, cuerpo } = await api.json('/heroes/1', { dificultad: 4 }, 'PATCH');
    assert.equal(status, 200);
    assert.equal(cuerpo.data.dificultad, 4);
    assert.equal(cuerpo.data.nombre, 'Aegis');
    assert.deepEqual(cuerpo.data.estadisticas, { vida: 3200, mana: 400, ataque: 60, armadura: 90 });
  });

  it('PATCH fusiona estadisticas parciales sin tocar las demas', async () => {
    const { cuerpo } = await api.json('/heroes/2', { estadisticas: { vida: 2222 } }, 'PATCH');
    assert.deepEqual(cuerpo.data.estadisticas, { vida: 2222, mana: 1200, ataque: 55, armadura: 25 });
  });

  it('PATCH vuelve a validar el heroe completo: las reglas cruzadas cuentan', async () => {
    const baja = await api.json('/heroes/1', { estadisticas: { armadura: 10 } }, 'PATCH');
    assert.equal(baja.status, 400);
    assert.deepEqual(baja.cuerpo.errores.map((e) => `${e.en}:${e.ruta}:${e.codigo}`), [
      'cuerpo:estadisticas.armadura:tanque_sin_armadura',
    ]);
    assert.equal((await api.pedir('/heroes/1')).cuerpo.data.estadisticas.armadura, 90);

    const costosas = heroeValido().habilidades.map((h) => ({ ...h, costoMana: 10 }));
    const sinMana = await api.json('/heroes/9', { habilidades: costosas }, 'PATCH');
    assert.deepEqual(sinMana.cuerpo.errores.map((e) => e.codigo), ['mana_inconsistente']);
  });

  it('PATCH cambia el rol si el resto de reglas se cumple', async () => {
    const { status, cuerpo } = await api.json('/heroes/1', { rol: 'luchador' }, 'PATCH');
    assert.equal(status, 200);
    assert.equal(cuerpo.data.rol, 'luchador');
  });

  it('PATCH valida cuerpo vacio, campos ajenos y nombre repetido', async () => {
    const vacio = await api.json('/heroes/1', {}, 'PATCH');
    assert.deepEqual(vacio.cuerpo.errores.map((e) => e.codigo), ['sin_cambios']);
    const ajeno = await api.json('/heroes/1', { id: 5, creadoEn: 'ayer' }, 'PATCH');
    assert.deepEqual(ajeno.cuerpo.errores.map((e) => e.ruta), ['id', 'creadoEn']);
    const repetido = await api.json('/heroes/1', { nombre: 'BRUMA' }, 'PATCH');
    assert.deepEqual([repetido.status, repetido.cuerpo.codigo], [409, 'NOMBRE_DUPLICADO']);
    const mismo = await api.json('/heroes/1', { nombre: 'aegis' }, 'PATCH');
    assert.equal(mismo.status, 200);
    assert.equal((await api.json('/heroes/99', { dificultad: 2 }, 'PATCH')).status, 404);
  });

  it('PATCH informa a la vez los errores de la ruta y del cuerpo', async () => {
    const { cuerpo } = await api.json('/heroes/abc', { rol: 'bardo' }, 'PATCH');
    assert.deepEqual(cuerpo.errores.map((e) => `${e.en}:${e.ruta}`), ['parametros:id', 'cuerpo:rol']);
  });

  it('responde 405 con Allow', async () => {
    const lista = await api.pedir('/heroes', { method: 'DELETE' });
    assert.deepEqual([lista.status, lista.cabeceras.get('allow')], [405, 'GET, POST']);
    const uno = await api.pedir('/heroes/1', { method: 'PUT' });
    assert.deepEqual([uno.status, uno.cabeceras.get('allow')], [405, 'GET, PATCH']);
  });
});
