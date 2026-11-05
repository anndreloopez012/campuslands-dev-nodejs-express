import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { s } from '../src/schemas/index.js';
import { resumenDeErrores } from '../soporte/datos.js';

const exito = (esquema, valor) => {
  const resultado = esquema.validar(valor);
  assert.equal(resultado.exito, true, JSON.stringify(resultado.errores));
  return resultado.datos;
};

const fallo = (esquema, valor) => {
  const resultado = esquema.validar(valor);
  assert.equal(resultado.exito, false, `se esperaba un error para ${JSON.stringify(valor)}`);
  return resultado.errores;
};

describe('schema de texto', () => {
  it('acepta textos y rechaza otros tipos con un mensaje claro', () => {
    assert.equal(exito(s.texto(), 'hola'), 'hola');
    assert.equal(exito(s.texto(), ''), '');
    assert.deepEqual(fallo(s.texto(), 42), [
      { ruta: '$', codigo: 'tipo_invalido', mensaje: 'debe ser un texto, se recibio numero' },
    ]);
    for (const valor of [true, [], {}, NaN]) assert.equal(fallo(s.texto(), valor)[0].codigo, 'tipo_invalido');
  });

  it('distingue entre faltante y nulo', () => {
    assert.deepEqual(resumenDeErrores({ errores: fallo(s.texto(), undefined) }), ['$:requerido']);
    assert.deepEqual(resumenDeErrores({ errores: fallo(s.texto(), null) }), ['$:nulo_no_permitido']);
  });

  it('valida los limites de largo en el borde', () => {
    const esquema = s.texto().min(3).max(5);
    assert.equal(exito(esquema, 'abc'), 'abc');
    assert.equal(exito(esquema, 'abcde'), 'abcde');
    assert.equal(fallo(esquema, 'ab')[0].codigo, 'muy_corto');
    assert.equal(fallo(esquema, 'abcdef')[0].codigo, 'muy_largo');
    assert.equal(fallo(s.texto().largo(4), 'abc')[0].codigo, 'largo_invalido');
    assert.equal(exito(s.texto().largo(4), 'abcd'), 'abcd');
  });

  it('usa singular y plural en los mensajes', () => {
    assert.equal(fallo(s.texto().min(1), '')[0].mensaje, 'debe tener al menos 1 caracter');
    assert.equal(fallo(s.texto().min(2), '')[0].mensaje, 'debe tener al menos 2 caracteres');
    assert.equal(fallo(s.texto().max(1), 'ab')[0].mensaje, 'debe tener como maximo 1 caracter');
  });

  it('limpia el texto antes de validarlo', () => {
    const esquema = s.texto().recortar().normalizarEspacios().min(3);
    assert.equal(exito(esquema, '  hola    mundo  '), 'hola mundo');
    assert.equal(fallo(esquema, '  ab  ')[0].codigo, 'muy_corto');
    assert.equal(exito(s.texto().recortar().minusculas().patron(/^[a-z]+$/), '  ABC '), 'abc');
    assert.equal(exito(s.texto().mayusculas(), 'abc'), 'ABC');
  });

  it('el orden de recortar y min en la cadena no cambia el resultado', () => {
    assert.equal(fallo(s.texto().min(3).recortar(), '  ab  ')[0].codigo, 'muy_corto');
    assert.equal(exito(s.texto().min(3).recortar(), '  abc  '), 'abc');
  });

  it('valida patrones con mensaje propio', () => {
    const esquema = s.texto().patron(/^\d+$/, 'solo numeros');
    assert.equal(exito(esquema, '123'), '123');
    assert.deepEqual(fallo(esquema, '12a'), [{ ruta: '$', codigo: 'patron_invalido', mensaje: 'solo numeros' }]);
    assert.equal(fallo(s.texto().patron(/^a$/), 'b')[0].mensaje, 'tiene un formato invalido');
  });

  it('valida emails', () => {
    const esquema = s.texto().email();
    assert.equal(exito(esquema, 'a@b.co'), 'a@b.co');
    for (const invalido of ['a@b', 'a b@c.com', '@c.com', 'a@.com', `${'a'.repeat(120)}@x.com`]) {
      assert.equal(fallo(esquema, invalido)[0].codigo, 'formato_invalido', invalido);
    }
  });

  it('informa solo el primer chequeo que falla', () => {
    const errores = fallo(s.texto().min(5).patron(/^\d+$/), 'ab');
    assert.equal(errores.length, 1);
    assert.equal(errores[0].codigo, 'muy_corto');
  });
});

describe('schemas numericos', () => {
  it('numero acepta finitos y rechaza el resto', () => {
    assert.equal(exito(s.numero(), 1.5), 1.5);
    assert.equal(exito(s.numero(), -0.25), -0.25);
    for (const valor of ['1', NaN, Infinity, -Infinity, null, true, [], {}]) {
      assert.ok(fallo(s.numero(), valor).length, String(valor));
    }
    assert.equal(fallo(s.numero(), '1')[0].codigo, 'tipo_invalido');
  });

  it('entero rechaza decimales con un codigo propio', () => {
    assert.equal(exito(s.entero(), 7), 7);
    assert.deepEqual(fallo(s.entero(), 2.5), [{ ruta: '$', codigo: 'no_entero', mensaje: 'debe ser un numero entero' }]);
  });

  it('valida minimo y maximo en el borde', () => {
    const esquema = s.entero().min(1).max(5);
    assert.equal(exito(esquema, 1), 1);
    assert.equal(exito(esquema, 5), 5);
    assert.equal(fallo(esquema, 0)[0].codigo, 'muy_pequeno');
    assert.equal(fallo(esquema, 6)[0].codigo, 'muy_grande');
    assert.equal(fallo(esquema, 0)[0].mensaje, 'debe ser mayor o igual a 1');
    assert.equal(fallo(esquema, 6)[0].mensaje, 'debe ser menor o igual a 5');
    assert.equal(exito(s.numero().min(0), 0), 0);
  });

  it('coaccionar convierte solo textos con forma de numero', () => {
    const esquema = s.entero().coaccionar().min(-10);
    assert.equal(exito(esquema, '12'), 12);
    assert.equal(exito(esquema, '-3'), -3);
    assert.equal(exito(esquema, '0'), 0);
    assert.equal(exito(esquema, 8), 8);
    for (const texto of ['', ' 1', '1 ', '1e3', '007', '0x10', '1,5', 'abc', '+1', '--1']) {
      assert.equal(fallo(esquema, texto)[0].codigo, 'tipo_invalido', JSON.stringify(texto));
    }
    assert.equal(fallo(esquema, '2.5')[0].codigo, 'no_entero');
    assert.equal(exito(s.numero().coaccionar(), '2.5'), 2.5);
  });

  it('sin coaccionar un texto numerico se rechaza', () => {
    assert.equal(fallo(s.entero(), '12')[0].codigo, 'tipo_invalido');
  });

  it('coaccionar aplica los limites al valor convertido', () => {
    assert.equal(fallo(s.entero().coaccionar().max(50), '51')[0].codigo, 'muy_grande');
    assert.equal(fallo(s.entero().coaccionar().max(50), '99999999999999999999')[0].codigo, 'muy_grande');
  });
});

describe('schemas simples', () => {
  it('booleano estricto y con coaccion', () => {
    assert.equal(exito(s.booleano(), true), true);
    assert.equal(exito(s.booleano(), false), false);
    for (const valor of ['true', 1, 0, 'si']) assert.equal(fallo(s.booleano(), valor)[0].codigo, 'tipo_invalido');
    assert.equal(exito(s.booleano().coaccionar(), 'true'), true);
    assert.equal(exito(s.booleano().coaccionar(), 'false'), false);
    assert.equal(fallo(s.booleano().coaccionar(), 'TRUE')[0].codigo, 'tipo_invalido');
  });

  it('enumerado lista las opciones validas', () => {
    const esquema = s.enumerado(['a', 'b']);
    assert.equal(exito(esquema, 'a'), 'a');
    assert.deepEqual(fallo(esquema, 'c'), [{ ruta: '$', codigo: 'enum_invalido', mensaje: 'debe ser uno de: a, b' }]);
    assert.equal(fallo(esquema, 1)[0].codigo, 'enum_invalido');
    assert.equal(fallo(esquema, ['a'])[0].codigo, 'enum_invalido');
  });

  it('enumerado no se altera si se modifica el arreglo original', () => {
    const valores = ['a', 'b'];
    const esquema = s.enumerado(valores);
    valores.push('c');
    assert.equal(fallo(esquema, 'c')[0].codigo, 'enum_invalido');
  });

  it('literal exige el valor exacto', () => {
    assert.equal(exito(s.literal('ban'), 'ban'), 'ban');
    assert.equal(fallo(s.literal('ban'), 'pick')[0].mensaje, 'debe ser exactamente "ban"');
    assert.equal(exito(s.literal(5), 5), 5);
    assert.equal(fallo(s.literal(5), '5')[0].codigo, 'literal_invalido');
  });
});

describe('fechas', () => {
  it('fecha acepta solo fechas reales AAAA-MM-DD', () => {
    assert.equal(exito(s.fecha(), '2024-02-29'), '2024-02-29');
    for (const invalida of ['2023-02-29', '2024-02-30', '2024-13-01', '2024-1-1', '24-01-01', '2024-01-01T00:00:00Z', '']) {
      assert.equal(fallo(s.fecha(), invalida)[0].codigo, 'formato_invalido', invalida);
    }
    assert.equal(fallo(s.fecha(), 20240101)[0].codigo, 'tipo_invalido');
  });

  it('fecha respeta desde y hasta de forma inclusiva', () => {
    const esquema = s.fecha().desde('2020-01-01').hasta('2030-12-31');
    assert.equal(exito(esquema, '2020-01-01'), '2020-01-01');
    assert.equal(exito(esquema, '2030-12-31'), '2030-12-31');
    assert.equal(fallo(esquema, '2019-12-31')[0].codigo, 'muy_pequeno');
    assert.equal(fallo(esquema, '2031-01-01')[0].codigo, 'muy_grande');
  });

  it('fechaHora normaliza a ISO y exige UTC', () => {
    assert.equal(exito(s.fechaHora(), '2026-11-04T18:30:00Z'), '2026-11-04T18:30:00.000Z');
    assert.equal(exito(s.fechaHora(), '2026-11-04T18:30Z'), '2026-11-04T18:30:00.000Z');
    assert.equal(exito(s.fechaHora(), '2026-11-04T18:30:00.5Z'), '2026-11-04T18:30:00.500Z');
    for (const invalida of ['2026-11-04', '2026-11-04T18:30:00', '2026-11-04T18:30:00+02:00', '2026-02-30T10:00:00Z', '2026-11-04T25:00:00Z', 'ayer']) {
      assert.equal(fallo(s.fechaHora(), invalida)[0].codigo, 'formato_invalido', invalida);
    }
  });
});

describe('modificadores comunes', () => {
  it('opcional deja pasar undefined pero no null', () => {
    assert.equal(exito(s.texto().opcional(), undefined), undefined);
    assert.equal(fallo(s.texto().opcional(), null)[0].codigo, 'nulo_no_permitido');
  });

  it('nulo deja pasar null pero sigue exigiendo el campo', () => {
    assert.equal(exito(s.texto().nulo(), null), null);
    assert.equal(fallo(s.texto().nulo(), undefined)[0].codigo, 'requerido');
    assert.equal(exito(s.texto().nulo().opcional(), undefined), undefined);
  });

  it('defecto reemplaza solo a undefined', () => {
    const esquema = s.entero().defecto(3);
    assert.equal(exito(esquema, undefined), 3);
    assert.equal(exito(esquema, 9), 9);
    assert.equal(fallo(esquema, null)[0].codigo, 'nulo_no_permitido');
    assert.equal(exito(s.texto().nulo().defecto(null), undefined), null);
  });

  it('defecto entrega una copia nueva cada vez', () => {
    const esquema = s.arreglo(s.texto()).defecto([]);
    const primera = exito(esquema, undefined);
    primera.push('contaminado');
    assert.deepEqual(exito(esquema, undefined), []);
  });

  it('los modificadores devuelven esquemas nuevos sin tocar el original', () => {
    const base = s.texto();
    const estricto = base.min(5);
    const opcional = base.opcional();
    assert.equal(exito(base, 'ab'), 'ab');
    assert.equal(fallo(estricto, 'ab')[0].codigo, 'muy_corto');
    assert.equal(fallo(base, undefined)[0].codigo, 'requerido');
    assert.equal(exito(opcional, undefined), undefined);
    assert.notEqual(base, estricto);
  });

  it('transformar se aplica despues de validar y en orden', () => {
    const esquema = s.entero().min(1).transformar((n) => n * 2).transformar((n) => `#${n}`);
    assert.equal(exito(esquema, 4), '#8');
    assert.equal(fallo(esquema, 0)[0].codigo, 'muy_pequeno');
  });

  it('refinar informa su codigo y mensaje, y solo corre con el tipo correcto', () => {
    let llamadas = 0;
    const esquema = s.entero().refinar((n) => {
      llamadas += 1;
      return n % 2 === 0;
    }, { codigo: 'impar', mensaje: 'debe ser par' });
    assert.equal(exito(esquema, 4), 4);
    assert.deepEqual(fallo(esquema, 3), [{ ruta: '$', codigo: 'impar', mensaje: 'debe ser par' }]);
    fallo(esquema, 'x');
    assert.equal(llamadas, 2);
  });

  it('verificar puede informar varios problemas a la vez', () => {
    const esquema = s.texto().verificar((texto, informar) => {
      if (!/\d/.test(texto)) informar({ codigo: 'sin_numero', mensaje: 'falta un numero' });
      if (!/[A-Z]/.test(texto)) informar({ codigo: 'sin_mayuscula', mensaje: 'falta una mayuscula' });
    });
    assert.deepEqual(fallo(esquema, 'abc').map((e) => e.codigo), ['sin_numero', 'sin_mayuscula']);
    assert.equal(exito(esquema, 'Abc1'), 'Abc1');
  });

  it('una verificacion sin codigo ni mensaje usa valores por defecto', () => {
    const esquema = s.texto().verificar((texto, informar) => informar({}));
    assert.deepEqual(fallo(esquema, 'x'), [{ ruta: '$', codigo: 'personalizado', mensaje: 'no cumple una regla' }]);
  });

  it('parsear lanza ValidationError con la lista de errores y su origen', () => {
    assert.equal(s.texto().min(2).parsear('ok'), 'ok');
    assert.throws(
      () => s.texto().min(2).parsear('x', { en: 'consulta' }),
      (error) => {
        assert.equal(error.statusCode, 400);
        assert.equal(error.codigo, 'VALIDACION');
        assert.deepEqual(error.detalles, [
          { en: 'consulta', ruta: '$', codigo: 'muy_corto', mensaje: 'debe tener al menos 2 caracteres' },
        ]);
        return true;
      },
    );
  });
});
