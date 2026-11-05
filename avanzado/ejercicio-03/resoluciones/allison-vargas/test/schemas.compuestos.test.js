import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { s, formatearRuta } from '../src/schemas/index.js';
import { resumenDeErrores } from '../soporte/datos.js';

const exito = (esquema, valor) => {
  const resultado = esquema.validar(valor);
  assert.equal(resultado.exito, true, JSON.stringify(resultado.errores));
  return resultado.datos;
};

const errores = (esquema, valor) => {
  const resultado = esquema.validar(valor);
  assert.equal(resultado.exito, false, `se esperaba un error para ${JSON.stringify(valor)}`);
  return resumenDeErrores(resultado);
};

describe('rutas de error', () => {
  it('formatea segmentos con puntos e indices', () => {
    assert.equal(formatearRuta([]), '$');
    assert.equal(formatearRuta(['a']), 'a');
    assert.equal(formatearRuta(['a', 'b']), 'a.b');
    assert.equal(formatearRuta(['a', 0, 'b']), 'a[0].b');
    assert.equal(formatearRuta([0, 'x']), '[0].x');
    assert.equal(formatearRuta([0, 1]), '[0][1]');
  });
});

describe('schema de arreglo', () => {
  it('valida cada elemento y senala su posicion', () => {
    const esquema = s.arreglo(s.entero().min(1));
    assert.deepEqual(exito(esquema, [1, 2, 3]), [1, 2, 3]);
    assert.deepEqual(errores(esquema, [1, 0, 'a', 4]), ['[1]:muy_pequeno', '[2]:tipo_invalido']);
  });

  it('rechaza lo que no es un arreglo', () => {
    for (const valor of ['a', 1, {}, { length: 1 }]) assert.deepEqual(errores(s.arreglo(s.texto()), valor), ['$:tipo_invalido']);
  });

  it('aplica las transformaciones de cada elemento', () => {
    assert.deepEqual(exito(s.arreglo(s.texto().recortar().minusculas()), [' A ', 'B']), ['a', 'b']);
  });

  it('valida min, max y largo en el borde', () => {
    const esquema = s.arreglo(s.texto()).min(1).max(2);
    assert.deepEqual(errores(esquema, []), ['$:muy_corto']);
    assert.deepEqual(errores(esquema, ['a', 'b', 'c']), ['$:muy_largo']);
    assert.equal(exito(esquema, ['a']).length, 1);
    assert.equal(exito(esquema, ['a', 'b']).length, 2);
    const exacto = s.arreglo(s.texto()).largo(2);
    assert.deepEqual(errores(exacto, ['a']), ['$:largo_invalido']);
    assert.equal(exito(exacto, ['a', 'b']).length, 2);
  });

  it('usa singular y plural en los mensajes de largo', () => {
    const resultado = s.arreglo(s.texto()).min(1).validar([]);
    assert.equal(resultado.errores[0].mensaje, 'debe tener al menos 1 elemento');
    assert.equal(s.arreglo(s.texto()).largo(4).validar([]).errores[0].mensaje, 'debe tener exactamente 4 elementos');
  });

  it('reporta a la vez los errores de elementos y de largo', () => {
    assert.deepEqual(errores(s.arreglo(s.entero()).max(1), ['a', 2]), ['[0]:tipo_invalido', '$:muy_largo']);
  });

  it('unico detecta repetidos y apunta al segundo', () => {
    const esquema = s.arreglo(s.texto()).unico();
    assert.equal(exito(esquema, ['a', 'b']).length, 2);
    const resultado = esquema.validar(['a', 'b', 'a']);
    assert.deepEqual(resultado.errores, [{ ruta: '[2]', codigo: 'duplicado', mensaje: 'ya aparece en la posicion 0' }]);
  });

  it('unico con selector y campo apunta al campo repetido', () => {
    const esquema = s.arreglo(s.objeto({ id: s.entero(), tag: s.texto() })).unico((x) => x.id, 'id');
    assert.deepEqual(errores(esquema, [{ id: 1, tag: 'a' }, { id: 2, tag: 'a' }, { id: 1, tag: 'b' }]), ['[2].id:duplicado']);
  });

  it('se pueden combinar varias reglas de unicidad', () => {
    const esquema = s.arreglo(s.objeto({ a: s.texto(), b: s.texto() })).unico((x) => x.a, 'a').unico((x) => x.b, 'b');
    assert.deepEqual(
      errores(esquema, [{ a: '1', b: 'x' }, { a: '1', b: 'y' }, { a: '2', b: 'x' }]),
      ['[1].a:duplicado', '[2].b:duplicado'],
    );
  });

  it('no revisa unicidad si algun elemento ya es invalido', () => {
    assert.deepEqual(errores(s.arreglo(s.entero()).unico(), [1, 1, 'x']), ['[2]:tipo_invalido']);
  });
});

describe('schema de objeto', () => {
  const persona = s.objeto({
    nombre: s.texto().min(2),
    edad: s.entero().min(0).defecto(18),
    apodo: s.texto().opcional(),
    direccion: s.objeto({ ciudad: s.texto(), cp: s.texto().opcional() }),
  });

  it('devuelve solo los campos definidos y aplica valores por defecto', () => {
    assert.deepEqual(exito(persona, { nombre: 'Ana', direccion: { ciudad: 'Quito' } }), {
      nombre: 'Ana',
      edad: 18,
      direccion: { ciudad: 'Quito' },
    });
  });

  it('senala los errores anidados con su ruta completa y en orden', () => {
    assert.deepEqual(
      errores(persona, { nombre: 'A', edad: -1, direccion: { ciudad: 5 } }),
      ['nombre:muy_corto', 'edad:muy_pequeno', 'direccion.ciudad:tipo_invalido'],
    );
    assert.deepEqual(errores(persona, {}), ['nombre:requerido', 'direccion:requerido']);
  });

  it('rechaza lo que no es un objeto plano', () => {
    for (const valor of ['x', 1, [], [1], new Date(), new Map()]) {
      assert.deepEqual(errores(persona, valor), ['$:tipo_invalido'], String(valor));
    }
    assert.deepEqual(errores(persona, null), ['$:nulo_no_permitido']);
    assert.deepEqual(errores(persona, undefined), ['$:requerido']);
  });

  it('rechaza campos desconocidos por defecto, uno por campo', () => {
    assert.deepEqual(
      errores(persona, { nombre: 'Ana', direccion: { ciudad: 'Q', calle: 'x' }, rol: 'admin', otro: 1 }),
      ['direccion.calle:campo_desconocido', 'rol:campo_desconocido', 'otro:campo_desconocido'],
    );
  });

  it('descartar elimina los campos desconocidos sin error', () => {
    const laxo = persona.descartar();
    assert.deepEqual(exito(laxo, { nombre: 'Ana', direccion: { ciudad: 'Q' }, extra: 1 }), {
      nombre: 'Ana',
      edad: 18,
      direccion: { ciudad: 'Q' },
    });
    assert.equal(persona.estricto().def.desconocidos, 'rechazar');
  });

  it('no deja pasar claves peligrosas como __proto__ o constructor', () => {
    const entrada = JSON.parse('{"nombre":"Ana","direccion":{"ciudad":"Q"},"__proto__":{"admin":true},"constructor":{"x":1}}');
    assert.deepEqual(errores(persona, entrada), ['__proto__:campo_desconocido', 'constructor:campo_desconocido']);
    const limpio = exito(persona.descartar(), entrada);
    assert.equal(Object.hasOwn(limpio, '__proto__'), false);
    assert.equal({}.admin, undefined);
    assert.equal(limpio.admin, undefined);
  });

  it('no lee propiedades heredadas como si fueran del objeto', () => {
    const esquema = s.objeto({ toString: s.texto().opcional(), valueOf: s.texto().opcional() });
    assert.deepEqual(exito(esquema, {}), {});
  });

  it('acepta objetos sin prototipo', () => {
    const entrada = Object.assign(Object.create(null), { nombre: 'Ana', direccion: { ciudad: 'Q' } });
    assert.equal(exito(persona, entrada).nombre, 'Ana');
  });

  it('las verificaciones del objeto corren solo si todos los campos son validos', () => {
    let llamadas = 0;
    const rango = s.objeto({ desde: s.entero(), hasta: s.entero() }).refinar((r) => {
      llamadas += 1;
      return r.desde <= r.hasta;
    }, { codigo: 'rango_invertido', mensaje: 'desde no puede superar a hasta', ruta: 'hasta' });
    assert.deepEqual(errores(rango, { desde: 5, hasta: 1 }), ['hasta:rango_invertido']);
    assert.deepEqual(errores(rango, { desde: 'a', hasta: 1 }), ['desde:tipo_invalido']);
    assert.equal(llamadas, 1);
    assert.deepEqual(exito(rango, { desde: 1, hasta: 1 }), { desde: 1, hasta: 1 });
  });

  it('las rutas de las verificaciones se anidan bajo el objeto que las define', () => {
    const interior = s.objeto({ a: s.entero(), b: s.entero() }).refinar((v) => v.a < v.b, { ruta: 'b', codigo: 'orden' });
    const exterior = s.objeto({ lista: s.arreglo(interior) });
    assert.deepEqual(errores(exterior, { lista: [{ a: 1, b: 2 }, { a: 3, b: 3 }] }), ['lista[1].b:orden']);
  });

  it('una verificacion puede apuntar a un indice de arreglo con una ruta en lista', () => {
    const esquema = s.objeto({ xs: s.arreglo(s.entero()) }).verificar((valor, informar) => {
      valor.xs.forEach((x, i) => {
        if (x < 0) informar({ ruta: ['xs', i], codigo: 'negativo', mensaje: 'no puede ser negativo' });
      });
    });
    assert.deepEqual(errores(esquema, { xs: [1, -1, 2, -2] }), ['xs[1]:negativo', 'xs[3]:negativo']);
  });

  it('varias verificaciones se acumulan', () => {
    const esquema = s.objeto({ n: s.entero() })
      .refinar((v) => v.n > 0, { codigo: 'positivo' })
      .refinar((v) => v.n % 2 === 0, { codigo: 'par' });
    assert.deepEqual(errores(esquema, { n: -3 }), ['$:positivo', '$:par']);
  });
});

describe('derivar esquemas de objeto', () => {
  const base = s.objeto({
    nombre: s.texto().min(2),
    edad: s.entero().defecto(18),
    datos: s.objeto({ a: s.entero().defecto(1), b: s.texto() }),
  }).refinar((v) => v.nombre !== 'root', { codigo: 'reservado', ruta: 'nombre' });

  it('parcial vuelve opcionales los campos, quita defaults y descarta reglas cruzadas', () => {
    const parcial = base.parcial();
    assert.deepEqual(exito(parcial, {}), {});
    assert.deepEqual(exito(parcial, { nombre: 'root' }), { nombre: 'root' });
    assert.deepEqual(errores(parcial, { nombre: 'x' }), ['nombre:muy_corto']);
    assert.deepEqual(exito(parcial, { datos: { b: 'x' } }), { datos: { a: 1, b: 'x' } });
  });

  it('parcial profundo tambien relaja los objetos anidados', () => {
    const profundo = base.parcial({ profundo: true });
    assert.deepEqual(exito(profundo, { datos: { b: 'x' } }), { datos: { b: 'x' } });
    assert.deepEqual(exito(profundo, { datos: {} }), { datos: {} });
    assert.deepEqual(errores(base.parcial(), { datos: {} }), ['datos.b:requerido']);
  });

  it('minimoUnCampo exige que llegue algo', () => {
    const edicion = base.parcial().minimoUnCampo();
    assert.deepEqual(errores(edicion, {}), ['$:sin_cambios']);
    assert.deepEqual(exito(edicion, { edad: 3 }), { edad: 3 });
  });

  it('pick y omit arman esquemas mas chicos', () => {
    assert.deepEqual(exito(base.pick(['nombre']), { nombre: 'Ana' }), { nombre: 'Ana' });
    assert.deepEqual(errores(base.pick(['nombre']), { nombre: 'Ana', edad: 3 }), ['edad:campo_desconocido']);
    assert.deepEqual(exito(base.omit(['datos']), { nombre: 'Ana' }), { nombre: 'Ana', edad: 18 });
    assert.throws(() => base.pick(['inexistente']), /no tiene el campo inexistente/);
    assert.throws(() => base.omit(['nada']), /no tiene el campo nada/);
  });

  it('extender agrega campos y conserva las reglas', () => {
    const grande = base.extender({ activo: s.booleano().defecto(true) });
    assert.deepEqual(exito(grande, { nombre: 'Ana', datos: { b: 'x' } }), {
      nombre: 'Ana',
      edad: 18,
      datos: { a: 1, b: 'x' },
      activo: true,
    });
    assert.deepEqual(errores(grande, { nombre: 'root', datos: { b: 'x' } }), ['nombre:reservado']);
  });

  it('derivar no modifica el esquema original', () => {
    base.parcial();
    base.omit(['datos']);
    assert.deepEqual(errores(base, {}), ['nombre:requerido', 'datos:requerido']);
  });
});

describe('union por discriminador', () => {
  const evento = s.unionPor('tipo', {
    gol: s.objeto({ tipo: s.literal('gol'), minuto: s.entero().min(0).max(120) }),
    tarjeta: s.objeto({ tipo: s.literal('tarjeta'), color: s.enumerado(['roja', 'amarilla']) }),
  });

  it('valida contra la variante que indica el discriminador', () => {
    assert.deepEqual(exito(evento, { tipo: 'gol', minuto: 10 }), { tipo: 'gol', minuto: 10 });
    assert.deepEqual(exito(evento, { tipo: 'tarjeta', color: 'roja' }), { tipo: 'tarjeta', color: 'roja' });
  });

  it('reporta solo los errores de la variante elegida', () => {
    assert.deepEqual(errores(evento, { tipo: 'gol', minuto: 200 }), ['minuto:muy_grande']);
    assert.deepEqual(errores(evento, { tipo: 'gol', color: 'roja' }), ['minuto:requerido', 'color:campo_desconocido']);
  });

  it('informa discriminadores faltantes o desconocidos', () => {
    assert.deepEqual(errores(evento, {}), ['tipo:requerido']);
    assert.deepEqual(errores(evento, { tipo: 'penal' }), ['tipo:enum_invalido']);
    assert.deepEqual(errores(evento, { tipo: 5 }), ['tipo:enum_invalido']);
    assert.deepEqual(errores(evento, { tipo: 'toString' }), ['tipo:enum_invalido']);
    assert.deepEqual(errores(evento, { tipo: '__proto__' }), ['tipo:enum_invalido']);
  });

  it('rechaza lo que no es un objeto', () => {
    for (const valor of ['gol', 3, [], [{ tipo: 'gol' }]]) assert.deepEqual(errores(evento, valor), ['$:tipo_invalido']);
  });

  it('funciona dentro de arreglos con la posicion en la ruta', () => {
    const lista = s.arreglo(evento);
    assert.deepEqual(
      errores(lista, [{ tipo: 'gol', minuto: 1 }, { tipo: 'x' }, { tipo: 'tarjeta', color: 'azul' }]),
      ['[1].tipo:enum_invalido', '[2].color:enum_invalido'],
    );
  });
});
