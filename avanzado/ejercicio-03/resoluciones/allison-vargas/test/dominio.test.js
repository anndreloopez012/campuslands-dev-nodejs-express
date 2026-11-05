import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadJson } from '../src/utils/loadJson.js';
import { esquemaHeroe, esquemaHeroeEdicion } from '../src/validators/heroe.schema.js';
import { esquemaEquipo } from '../src/validators/equipo.schema.js';
import { esquemaDraft } from '../src/validators/draft.schema.js';
import { draftValido, equipoValido, heroeValido, resumenDeErrores } from '../soporte/datos.js';

const sinMetadatos = ({ id, creadoEn, ...resto }) => resto;

const errores = (esquema, valor) => {
  const resultado = esquema.validar(valor);
  assert.equal(resultado.exito, false, 'se esperaba un error');
  return resumenDeErrores(resultado);
};

const exito = (esquema, valor) => {
  const resultado = esquema.validar(valor);
  assert.equal(resultado.exito, true, JSON.stringify(resultado.errores));
  return resultado.datos;
};

describe('datos de ejemplo', () => {
  it('todos los heroes de ejemplo cumplen el schema sin cambios', () => {
    for (const heroe of loadJson('heroes.json')) {
      assert.deepEqual(exito(esquemaHeroe, sinMetadatos(heroe)), sinMetadatos(heroe), heroe.nombre);
    }
  });

  it('todos los equipos de ejemplo cumplen el schema sin cambios', () => {
    for (const equipo of loadJson('equipos.json')) {
      assert.deepEqual(exito(esquemaEquipo, sinMetadatos(equipo)), sinMetadatos(equipo), equipo.nombre);
    }
  });
});

describe('schema de heroe', () => {
  it('normaliza el texto y completa los valores por defecto', () => {
    const heroe = exito(esquemaHeroe, heroeValido());
    assert.equal(heroe.nombre, 'Rayo Veloz');
    assert.deepEqual(heroe.etiquetas, ['rapido', 'agil']);
    assert.equal(heroe.estadisticas.mana, 0);
    assert.equal(heroe.lanzamiento, undefined);
  });

  it('las etiquetas son opcionales y por defecto vacias', () => {
    const { etiquetas, ...sinEtiquetas } = heroeValido();
    assert.deepEqual(exito(esquemaHeroe, sinEtiquetas).etiquetas, []);
  });

  it('valida el nombre', () => {
    for (const nombre of ['A', 'x'.repeat(25), '1Rayo', 'Rayo!', 'Ray_o', '   ']) {
      assert.ok(errores(esquemaHeroe, heroeValido({ nombre })).some((e) => e.startsWith('nombre:')), nombre);
    }
    assert.equal(exito(esquemaHeroe, heroeValido({ nombre: "D'Arc-Ana" })).nombre, "D'Arc-Ana");
  });

  it('rechaza roles y dificultades fuera de rango', () => {
    assert.deepEqual(errores(esquemaHeroe, heroeValido({ rol: 'bardo' })), ['rol:enum_invalido']);
    assert.deepEqual(errores(esquemaHeroe, heroeValido({ dificultad: 0 })), ['dificultad:muy_pequeno']);
    assert.deepEqual(errores(esquemaHeroe, heroeValido({ dificultad: 6 })), ['dificultad:muy_grande']);
    assert.deepEqual(errores(esquemaHeroe, heroeValido({ dificultad: 2.5 })), ['dificultad:no_entero']);
    assert.deepEqual(errores(esquemaHeroe, heroeValido({ dificultad: '3' })), ['dificultad:tipo_invalido']);
  });

  it('valida las estadisticas anidadas', () => {
    const base = heroeValido().estadisticas;
    assert.deepEqual(
      errores(esquemaHeroe, heroeValido({ estadisticas: { ...base, vida: 100, ataque: 'fuerte', extra: 1 } })),
      ['estadisticas.vida:muy_pequeno', 'estadisticas.ataque:tipo_invalido', 'estadisticas.extra:campo_desconocido'],
    );
    assert.deepEqual(errores(esquemaHeroe, heroeValido({ estadisticas: undefined })), ['estadisticas:requerido']);
  });

  it('exige exactamente cuatro habilidades con teclas distintas', () => {
    const habilidades = heroeValido().habilidades;
    assert.deepEqual(errores(esquemaHeroe, heroeValido({ habilidades: habilidades.slice(0, 3) })), ['habilidades:largo_invalido']);
    assert.deepEqual(
      errores(esquemaHeroe, heroeValido({ habilidades: [...habilidades.slice(0, 3), { ...habilidades[3], tecla: 'Q' }] })),
      ['habilidades[3].tecla:duplicado'],
    );
    assert.deepEqual(
      errores(esquemaHeroe, heroeValido({ habilidades: [{ ...habilidades[0], tecla: 'Z' }, ...habilidades.slice(1)] })),
      ['habilidades[0].tecla:enum_invalido'],
    );
  });

  it('valida cada habilidad por separado', () => {
    const habilidades = heroeValido().habilidades.map((h) => ({ ...h }));
    habilidades[1].enfriamiento = -1;
    habilidades[2].costoMana = 1.5;
    habilidades[3].nombre = 'x';
    assert.deepEqual(errores(esquemaHeroe, heroeValido({ habilidades })), [
      'habilidades[1].enfriamiento:muy_pequeno',
      'habilidades[2].costoMana:no_entero',
      'habilidades[3].nombre:muy_corto',
    ]);
  });

  it('limita y normaliza las etiquetas', () => {
    assert.deepEqual(errores(esquemaHeroe, heroeValido({ etiquetas: ['aa', 'bb', 'cc', 'dd', 'ee', 'ff'] })), ['etiquetas:muy_largo']);
    assert.deepEqual(errores(esquemaHeroe, heroeValido({ etiquetas: ['Rapido', ' rapido '] })), ['etiquetas[1]:duplicado']);
    assert.deepEqual(errores(esquemaHeroe, heroeValido({ etiquetas: ['a'] })), ['etiquetas[0]:muy_corto']);
  });

  it('valida la fecha de lanzamiento', () => {
    assert.equal(exito(esquemaHeroe, heroeValido({ lanzamiento: '2024-02-29' })).lanzamiento, '2024-02-29');
    assert.deepEqual(errores(esquemaHeroe, heroeValido({ lanzamiento: '2019-12-31' })), ['lanzamiento:muy_pequeno']);
    assert.deepEqual(errores(esquemaHeroe, heroeValido({ lanzamiento: '2024-02-30' })), ['lanzamiento:formato_invalido']);
  });

  it('un tanque necesita armadura minima', () => {
    const tanque = (armadura) => heroeValido({ rol: 'tanque', estadisticas: { vida: 3000, ataque: 60, armadura } });
    assert.deepEqual(errores(esquemaHeroe, tanque(49)), ['estadisticas.armadura:tanque_sin_armadura']);
    assert.equal(exito(esquemaHeroe, tanque(50)).rol, 'tanque');
    assert.equal(exito(esquemaHeroe, heroeValido({ rol: 'mago' })).rol, 'mago');
  });

  it('sin mana ninguna habilidad puede costar mana', () => {
    const costosas = heroeValido().habilidades.map((h) => ({ ...h, costoMana: 10 }));
    assert.deepEqual(errores(esquemaHeroe, heroeValido({ habilidades: costosas })), ['habilidades:mana_inconsistente']);
    const conMana = heroeValido({ habilidades: costosas, estadisticas: { vida: 1700, mana: 500, ataque: 90, armadura: 30 } });
    assert.equal(exito(esquemaHeroe, conMana).estadisticas.mana, 500);
  });

  it('informa varios problemas distintos en una sola respuesta', () => {
    const resultado = esquemaHeroe.validar({
      nombre: 'x',
      rol: 'bardo',
      dificultad: 9,
      estadisticas: { vida: 1, armadura: 'a' },
      habilidades: [],
      desconocido: true,
    });
    assert.deepEqual(resumenDeErrores(resultado), [
      'nombre:muy_corto',
      'rol:enum_invalido',
      'dificultad:muy_grande',
      'estadisticas.vida:muy_pequeno',
      'estadisticas.ataque:requerido',
      'estadisticas.armadura:tipo_invalido',
      'habilidades:largo_invalido',
      'desconocido:campo_desconocido',
    ]);
  });

  it('el schema de edicion acepta cambios parciales, incluso anidados', () => {
    assert.deepEqual(exito(esquemaHeroeEdicion, { dificultad: 4 }), { dificultad: 4 });
    assert.deepEqual(exito(esquemaHeroeEdicion, { estadisticas: { vida: 2000 } }), { estadisticas: { vida: 2000 } });
    assert.deepEqual(errores(esquemaHeroeEdicion, {}), ['$:sin_cambios']);
    assert.deepEqual(errores(esquemaHeroeEdicion, { rol: 'bardo' }), ['rol:enum_invalido']);
    assert.deepEqual(errores(esquemaHeroeEdicion, { estadisticas: { vida: 10 } }), ['estadisticas.vida:muy_pequeno']);
    assert.deepEqual(errores(esquemaHeroeEdicion, { id: 4 }), ['id:campo_desconocido']);
  });
});

describe('schema de equipo', () => {
  it('normaliza nombre, tag y datos opcionales', () => {
    const equipo = exito(esquemaEquipo, equipoValido());
    assert.equal(equipo.nombre, 'Furia Austral');
    assert.equal(equipo.tag, 'FAU');
    assert.equal(equipo.contacto, null);
    assert.equal(equipo.jugadores[0].capitan, false);
    assert.equal(equipo.jugadores[1].capitan, true);
  });

  it('valida el tag', () => {
    for (const tag of ['A', 'ABCDE', 'AB-C', 'a b']) {
      assert.deepEqual(errores(esquemaEquipo, equipoValido({ tag })), ['tag:patron_invalido'], tag);
    }
  });

  it('acepta contacto nulo o email valido y normaliza el email', () => {
    assert.equal(exito(esquemaEquipo, equipoValido({ contacto: null })).contacto, null);
    assert.equal(exito(esquemaEquipo, equipoValido({ contacto: ' Hola@Equipo.COM ' })).contacto, 'hola@equipo.com');
    assert.deepEqual(errores(esquemaEquipo, equipoValido({ contacto: 'no-es-email' })), ['contacto:formato_invalido']);
  });

  it('exige cinco jugadores', () => {
    const jugadores = equipoValido().jugadores;
    assert.deepEqual(errores(esquemaEquipo, equipoValido({ jugadores: jugadores.slice(0, 4) })), ['jugadores:largo_invalido']);
    assert.deepEqual(errores(esquemaEquipo, equipoValido({ jugadores: [...jugadores, { nick: 'Extra', rol: 'top' }] })), ['jugadores:largo_invalido']);
  });

  it('no repite roles ni nicks (sin importar mayusculas)', () => {
    const jugadores = equipoValido().jugadores.map((j) => ({ ...j }));
    jugadores[2].rol = 'top';
    assert.deepEqual(errores(esquemaEquipo, equipoValido({ jugadores })), ['jugadores[2].rol:duplicado']);
    const nicks = equipoValido().jugadores.map((j) => ({ ...j }));
    nicks[4].nick = 'ARCO';
    assert.deepEqual(errores(esquemaEquipo, equipoValido({ jugadores: nicks })), ['jugadores[4].nick:duplicado']);
  });

  it('exige exactamente un capitan', () => {
    const sinCapitan = equipoValido().jugadores.map((j) => ({ ...j, capitan: false }));
    const resultado = esquemaEquipo.validar(equipoValido({ jugadores: sinCapitan }));
    assert.deepEqual(resumenDeErrores(resultado), ['jugadores:capitan_requerido']);
    assert.match(resultado.errores[0].mensaje, /se recibieron 0/);
    const dos = equipoValido().jugadores.map((j, i) => ({ ...j, capitan: i < 2 }));
    assert.match(esquemaEquipo.validar(equipoValido({ jugadores: dos })).errores[0].mensaje, /se recibieron 2/);
  });

  it('valida cada jugador', () => {
    const jugadores = equipoValido().jugadores.map((j) => ({ ...j }));
    jugadores[0].nick = 'a b';
    jugadores[3].rol = 'entrenador';
    jugadores[4].capitan = 'si';
    assert.deepEqual(errores(esquemaEquipo, equipoValido({ jugadores })), [
      'jugadores[0].nick:patron_invalido',
      'jugadores[3].rol:enum_invalido',
      'jugadores[4].capitan:tipo_invalido',
    ]);
  });

  it('valida region y fecha de fundacion', () => {
    assert.deepEqual(errores(esquemaEquipo, equipoValido({ region: 'MARTE' })), ['region:enum_invalido']);
    assert.deepEqual(errores(esquemaEquipo, equipoValido({ fundado: '2005-01-01' })), ['fundado:muy_pequeno']);
  });
});

describe('schema de draft', () => {
  it('acepta un draft valido y normaliza la fecha', () => {
    const draft = exito(esquemaDraft, draftValido());
    assert.equal(draft.programadaPara, '2026-12-01T18:30:00.000Z');
    assert.equal(draft.acciones.length, 4);
    assert.equal(exito(esquemaDraft, draftValido({ programadaPara: undefined })).programadaPara, undefined);
  });

  it('cada accion se valida segun su tipo', () => {
    const acciones = [
      { tipo: 'ban', equipo: 'azul', heroe: 4, jugador: 'extra' },
      { tipo: 'pick', equipo: 'verde', heroe: 1, jugador: 'cazador' },
      { tipo: 'pick', equipo: 'rojo', heroe: 2 },
      { tipo: 'swap' },
      {},
    ];
    assert.deepEqual(errores(esquemaDraft, draftValido({ acciones })), [
      'acciones[0].jugador:campo_desconocido',
      'acciones[1].equipo:enum_invalido',
      'acciones[2].jugador:requerido',
      'acciones[3].tipo:enum_invalido',
      'acciones[4].tipo:requerido',
    ]);
  });

  it('los ids deben ser enteros positivos reales, no textos', () => {
    assert.deepEqual(errores(esquemaDraft, draftValido({ azul: '1' })), ['azul:tipo_invalido']);
    assert.deepEqual(errores(esquemaDraft, draftValido({ azul: 0 })), ['azul:muy_pequeno']);
    assert.deepEqual(errores(esquemaDraft, draftValido({ rojo: 1.5 })), ['rojo:no_entero']);
  });

  it('los equipos deben ser distintos', () => {
    assert.deepEqual(errores(esquemaDraft, draftValido({ azul: 1, rojo: 1 })), ['rojo:equipos_iguales']);
  });

  it('un heroe se usa una sola vez entre baneos y picks', () => {
    const acciones = [
      { tipo: 'ban', equipo: 'azul', heroe: 4 },
      { tipo: 'pick', equipo: 'rojo', heroe: 4, jugador: 'Solaris' },
      { tipo: 'ban', equipo: 'rojo', heroe: 4 },
    ];
    assert.deepEqual(errores(esquemaDraft, draftValido({ acciones })), [
      'acciones[1].heroe:heroe_repetido',
      'acciones[2].heroe:heroe_repetido',
    ]);
  });

  it('limita baneos y picks por equipo', () => {
    const baneos = [1, 2, 3, 4, 5, 6].map((heroe) => ({ tipo: 'ban', equipo: 'azul', heroe }));
    assert.deepEqual(errores(esquemaDraft, draftValido({ acciones: baneos })), ['acciones:limite_excedido']);
    const nicks = ['Cazador', 'Riva', 'Nexo', 'Brisa', 'Faro', 'Otro'];
    const picks = nicks.map((jugador, i) => ({ tipo: 'pick', equipo: 'azul', heroe: i + 1, jugador }));
    const resultado = esquemaDraft.validar(draftValido({ acciones: picks }));
    assert.deepEqual(resumenDeErrores(resultado), ['acciones:limite_excedido']);
    assert.match(resultado.errores[0].mensaje, /equipo azul tiene 6 picks/);
    const cinco = [1, 2, 3, 4, 5].map((heroe) => ({ tipo: 'ban', equipo: 'azul', heroe }));
    assert.equal(exito(esquemaDraft, draftValido({ acciones: cinco })).acciones.length, 5);
  });

  it('un jugador elige un solo heroe', () => {
    const acciones = [
      { tipo: 'pick', equipo: 'azul', heroe: 1, jugador: 'Cazador' },
      { tipo: 'pick', equipo: 'azul', heroe: 2, jugador: 'cazador' },
      { tipo: 'pick', equipo: 'rojo', heroe: 3, jugador: 'Cazador' },
    ];
    assert.deepEqual(errores(esquemaDraft, draftValido({ acciones })), ['acciones[1].jugador:jugador_repetido']);
  });

  it('exige entre 1 y 20 acciones', () => {
    assert.deepEqual(errores(esquemaDraft, draftValido({ acciones: [] })), ['acciones:muy_corto']);
    const veintiuna = Array.from({ length: 21 }, (_, i) => ({ tipo: 'ban', equipo: i % 2 ? 'azul' : 'rojo', heroe: i + 1 }));
    assert.ok(errores(esquemaDraft, draftValido({ acciones: veintiuna })).includes('acciones:muy_largo'));
  });

  it('rechaza fechas mal formadas', () => {
    assert.deepEqual(errores(esquemaDraft, draftValido({ programadaPara: '2026-12-01' })), ['programadaPara:formato_invalido']);
  });
});
