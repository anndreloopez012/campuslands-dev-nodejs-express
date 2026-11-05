import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PASOS_FICHAJE, PASOS_INTERCAMBIO } from '../src/constants/futbol.js';
import { DIA } from '../soporte/datos.js';
import { crearEntorno, fichaje, rechazaCon } from '../soporte/entorno.js';

const minimo = (entorno, id) => entorno.servicios.jugadores.obtener(id).valorMinimo;
const dinero = (entorno, id) => entorno.almacen.obtener('clubes', id).presupuesto;

describe('fichar', () => {
  it('mueve al jugador, el dinero, los contadores y deja registro', async () => {
    const e = crearEntorno();
    const { respuesta, repetida } = await e.servicios.fichajes.fichar(fichaje(21, 1, 9000));
    assert.equal(repetida, false);
    assert.equal(respuesta.comision, 450);
    assert.equal(dinero(e, 1), 120000 - 9450);
    assert.equal(dinero(e, 2), 90000 + 9000);
    const agente = e.almacen.obtener('agentes', e.almacen.obtener('jugadores', 21).agenteId);
    assert.equal(agente.saldo, 450);
    const jugador = e.almacen.obtener('jugadores', 21);
    assert.equal(jugador.clubId, 1);
    assert.equal(jugador.ultimoFichajeEn, '2026-11-04T12:00:00.000Z');
    assert.equal(e.almacen.obtener('clubes', 1).plantilla, 21);
    assert.equal(e.almacen.obtener('clubes', 2).plantilla, 19);
    assert.deepEqual(e.servicios.auditoria.verificar().violaciones, []);
  });

  it('registra cuatro movimientos que suman cero y una notificacion', async () => {
    const e = crearEntorno();
    const { respuesta } = await e.servicios.fichajes.fichar(fichaje(21, 1, 9000));
    const { data } = e.servicios.movimientos.listar({ fichajeId: respuesta.id, pagina: 1, limite: 10 });
    assert.deepEqual(data.map((m) => [m.tipo, m.monto]), [
      ['pago_fichaje', -9000],
      ['cobro_fichaje', 9000],
      ['comision_pagada', -450],
      ['comision_cobrada', 450],
    ]);
    assert.equal(data.reduce((total, m) => total + m.monto, 0), 0);
    assert.deepEqual(e.servicios.notificaciones.listar().map((n) => n.tipo), ['fichaje.confirmado']);
  });

  it('usa el salario indicado o conserva el anterior', async () => {
    const e = crearEntorno();
    const anterior = e.almacen.obtener('jugadores', 21).salario;
    await e.servicios.fichajes.fichar(fichaje(21, 1, 9000, { salario: 777 }));
    assert.equal(e.almacen.obtener('jugadores', 21).salario, 777);
    await e.servicios.fichajes.fichar(fichaje(22, 1, 9000));
    assert.notEqual(e.almacen.obtener('jugadores', 22).salario, 777);
    assert.ok(anterior > 0);
  });

  const reglas = [
    ['jugador inexistente', fichaje(999, 1, 100), 'JUGADOR_NO_ENCONTRADO', { jugadorId: 999 }],
    ['club inexistente', fichaje(21, 99, 9000), 'CLUB_NO_ENCONTRADO', { clubId: 99 }],
    ['mismo club', fichaje(21, 2, 9000), 'MISMO_CLUB', { jugadorId: 21, clubId: 2 }],
    ['modalidad distinta', fichaje(21, 5, 9000), 'MODALIDAD_DISTINTA', { jugador: 'futbol', club: 'futsal' }],
    ['precio bajo el minimo', fichaje(21, 1, 100), 'PRECIO_BAJO_EL_MINIMO', { precio: 100, minimo: 8080 }],
    ['presupuesto insuficiente', fichaje(21, 4, 14500), 'PRESUPUESTO_INSUFICIENTE', { clubId: 4, necesario: 15225, disponible: 15000, faltan: 225 }],
    ['plantilla completa', fichaje(22, 4, 8500), 'PLANTILLA_COMPLETA', { clubId: 4, plantilla: 19, maxima: 19 }],
    ['jugador recien fichado', fichaje(1, 2, 5000), 'JUGADOR_RECIEN_FICHADO', { jugadorId: 1, disponibleDesde: '2026-11-24T00:00:00.000Z' }],
  ];
  for (const [nombre, datos, codigo, contexto] of reglas) {
    it(`rechaza: ${nombre}`, async () => {
      const e = crearEntorno();
      const antes = e.almacen.instantanea();
      await assert.rejects(e.servicios.fichajes.fichar(datos), rechazaCon(codigo, contexto));
      assert.deepEqual(e.almacen.instantanea(), antes);
      assert.equal(e.servicios.notificaciones.listar().length, 0);
      assert.equal(e.servicios.transacciones.listar({ estado: 'revertida' }).length, 1);
    });
  }

  it('un club con la plantilla al minimo no puede vender', async () => {
    const e = crearEntorno();
    await assert.rejects(
      e.servicios.fichajes.fichar(fichaje(89, 5, minimo(e, 89))),
      rechazaCon('PLANTILLA_MINIMA', { clubId: 6, minima: 8 }),
    );
  });

  it('pasada la ventana el jugador vuelve a poder moverse', async () => {
    const e = crearEntorno();
    e.avanzar(19 * DIA);
    await assert.rejects(e.servicios.fichajes.fichar(fichaje(1, 2, 5000)), rechazaCon('JUGADOR_RECIEN_FICHADO'));
    e.avanzar(2 * DIA);
    await e.servicios.fichajes.fichar(fichaje(1, 2, 5000));
    assert.equal(e.almacen.obtener('jugadores', 1).clubId, 2);
  });

  it('el jugador recien fichado no puede volver a moverse de inmediato', async () => {
    const e = crearEntorno();
    await e.servicios.fichajes.fichar(fichaje(21, 1, 9000));
    await assert.rejects(e.servicios.fichajes.fichar(fichaje(21, 3, 9000)), rechazaCon('JUGADOR_RECIEN_FICHADO'));
  });
});

describe('un fallo en cualquier paso deshace todo', () => {
  for (const paso of PASOS_FICHAJE) {
    it(`fichar falla en "${paso}" y el estado queda identico`, async () => {
      const e = crearEntorno();
      const antes = e.almacen.instantanea();
      await assert.rejects(
        e.servicios.fichajes.fichar(fichaje(21, 1, 9000, { simularFalloEn: paso })),
        rechazaCon('FALLO_SIMULADO', { paso }),
      );
      assert.deepEqual(e.almacen.instantanea(), antes);
      assert.equal(e.servicios.notificaciones.listar().length, 0);
      assert.equal(e.servicios.transacciones.listar({ estado: 'revertida' })[0].error, 'FALLO_SIMULADO');
      assert.deepEqual(e.servicios.auditoria.verificar().violaciones, []);
    });
  }

  for (const paso of PASOS_INTERCAMBIO) {
    it(`intercambiar falla en "${paso}" y el estado queda identico`, async () => {
      const e = crearEntorno();
      const antes = e.almacen.instantanea();
      await assert.rejects(
        e.servicios.fichajes.intercambiar({ jugadorAId: 2, jugadorBId: 22, compensacion: { pagaClubId: 1, monto: 3000 }, simularFalloEn: paso }),
        rechazaCon('FALLO_SIMULADO', { paso }),
      );
      assert.deepEqual(e.almacen.instantanea(), antes);
    });
  }

  it('despues de un fallo la misma operacion se puede repetir sin efectos dobles', async () => {
    const e = crearEntorno();
    await assert.rejects(e.servicios.fichajes.fichar(fichaje(21, 1, 9000, { simularFalloEn: 'plantillas' })));
    await e.servicios.fichajes.fichar(fichaje(21, 1, 9000));
    assert.equal(dinero(e, 1), 120000 - 9450);
    assert.equal(e.almacen.obtener('clubes', 1).plantilla, 21);
    assert.equal(e.almacen.obtener('agentes', e.almacen.obtener('jugadores', 21).agenteId).saldo, 450);
  });

  it('los pasos se ejecutan en el orden declarado', async () => {
    const vistos = [];
    const e = crearEntorno({ pausa: async (paso) => { vistos.push(paso); } });
    await e.servicios.fichajes.fichar(fichaje(21, 1, 9000));
    assert.deepEqual(vistos, [...PASOS_FICHAJE]);
  });
});

describe('intercambiar', () => {
  it('cruza a los dos jugadores sin cambiar plantillas ni dinero', async () => {
    const e = crearEntorno();
    const { respuesta } = await e.servicios.fichajes.intercambiar({ jugadorAId: 2, jugadorBId: 22 });
    assert.equal(respuesta.tipo, 'intercambio');
    assert.equal(e.almacen.obtener('jugadores', 2).clubId, 2);
    assert.equal(e.almacen.obtener('jugadores', 22).clubId, 1);
    assert.equal(e.almacen.obtener('clubes', 1).plantilla, 20);
    assert.equal(dinero(e, 1), 120000);
    assert.deepEqual(e.servicios.notificaciones.listar().map((n) => n.tipo), ['intercambio.confirmado']);
  });

  it('mueve la compensacion entre los clubes y la asienta en el libro', async () => {
    const e = crearEntorno();
    const { respuesta } = await e.servicios.fichajes.intercambiar({
      jugadorAId: 2,
      jugadorBId: 22,
      compensacion: { pagaClubId: 1, monto: 3000 },
    });
    assert.equal(dinero(e, 1), 117000);
    assert.equal(dinero(e, 2), 93000);
    const { data } = e.servicios.movimientos.listar({ fichajeId: respuesta.id, pagina: 1, limite: 10 });
    assert.deepEqual(data.map((m) => [m.clubId, m.monto]), [[1, -3000], [2, 3000]]);
    assert.deepEqual(e.servicios.auditoria.verificar().violaciones, []);
  });

  const reglas = [
    ['mismo club', { jugadorAId: 2, jugadorBId: 3 }, 'JUGADORES_DEL_MISMO_CLUB', { clubId: 1 }],
    ['modalidad distinta', { jugadorAId: 2, jugadorBId: 79 }, 'MODALIDAD_DISTINTA', {}],
    ['jugador inexistente', { jugadorAId: 2, jugadorBId: 999 }, 'JUGADOR_NO_ENCONTRADO', { jugadorId: 999 }],
    ['recien fichado', { jugadorAId: 1, jugadorBId: 22 }, 'JUGADOR_RECIEN_FICHADO', { jugadorId: 1 }],
    ['pagador ajeno', { jugadorAId: 2, jugadorBId: 22, compensacion: { pagaClubId: 3, monto: 10 } }, 'COMPENSACION_INVALIDA', { pagaClubId: 3 }],
    ['pagador sin fondos', { jugadorAId: 60, jugadorBId: 22, compensacion: { pagaClubId: 4, monto: 20000 } }, 'PRESUPUESTO_INSUFICIENTE', { clubId: 4, faltan: 5000 }],
  ];
  for (const [nombre, datos, codigo, contexto] of reglas) {
    it(`rechaza: ${nombre}`, async () => {
      const e = crearEntorno();
      const antes = e.almacen.instantanea();
      await assert.rejects(e.servicios.fichajes.intercambiar(datos), rechazaCon(codigo, contexto));
      assert.deepEqual(e.almacen.instantanea(), antes);
    });
  }
});

describe('idempotencia', () => {
  it('repetir la misma peticion devuelve el mismo resultado sin volver a ejecutar', async () => {
    const e = crearEntorno();
    const primera = await e.servicios.fichajes.fichar(fichaje(21, 1, 9000), 'clave-abc-1');
    const segunda = await e.servicios.fichajes.fichar(fichaje(21, 1, 9000), 'clave-abc-1');
    assert.equal(primera.repetida, false);
    assert.equal(segunda.repetida, true);
    assert.deepEqual(segunda.respuesta, primera.respuesta);
    assert.equal(e.servicios.fichajes.listar({ pagina: 1, limite: 10 }).data.length, 1);
    assert.equal(dinero(e, 1), 120000 - 9450);
  });

  it('el orden de los campos no cambia la huella', async () => {
    const e = crearEntorno();
    await e.servicios.fichajes.fichar({ jugadorId: 21, clubDestinoId: 1, precio: 9000 }, 'clave-abc-2');
    const repetida = await e.servicios.fichajes.fichar({ precio: 9000, clubDestinoId: 1, jugadorId: 21 }, 'clave-abc-2');
    assert.equal(repetida.repetida, true);
  });

  it('la misma clave con otro cuerpo se rechaza', async () => {
    const e = crearEntorno();
    await e.servicios.fichajes.fichar(fichaje(21, 1, 9000), 'clave-abc-3');
    await assert.rejects(
      e.servicios.fichajes.fichar(fichaje(22, 1, 9000), 'clave-abc-3'),
      rechazaCon('IDEMPOTENCIA_CONFLICTO'),
    );
  });

  it('una peticion fallida no consume la clave', async () => {
    const e = crearEntorno();
    await assert.rejects(e.servicios.fichajes.fichar(fichaje(21, 1, 100), 'clave-abc-4'), rechazaCon('PRECIO_BAJO_EL_MINIMO'));
    await assert.rejects(e.servicios.fichajes.fichar(fichaje(21, 1, 100), 'clave-abc-4'), rechazaCon('PRECIO_BAJO_EL_MINIMO'));
    const exito = await e.servicios.fichajes.fichar(fichaje(21, 1, 9000), 'clave-abc-4');
    assert.equal(exito.repetida, false);
  });
});

describe('simulacion', () => {
  it('muestra que cambiaria sin cambiar nada', async () => {
    const e = crearEntorno();
    const antes = e.almacen.instantanea();
    const resultado = await e.servicios.fichajes.simularFichaje(fichaje(21, 1, 9000));
    assert.equal(resultado.viable, true);
    const club = resultado.cambios.find((c) => c.coleccion === 'clubes' && c.id === 1);
    assert.equal(club.antes.presupuesto, 120000);
    assert.equal(club.despues.presupuesto, 110550);
    assert.equal(resultado.cambios.filter((c) => c.tipo === 'insertar').length, 5);
    assert.deepEqual(e.almacen.instantanea(), antes);
    assert.equal(e.servicios.notificaciones.listar().length, 0);
  });

  it('si no es viable explica la regla en lugar de lanzar el error', async () => {
    const e = crearEntorno();
    const resultado = await e.servicios.fichajes.simularFichaje(fichaje(21, 5, 9000));
    assert.equal(resultado.viable, false);
    assert.equal(resultado.error.codigo, 'MODALIDAD_DISTINTA');
    assert.equal(resultado.cambios, undefined);
  });

  it('un fallo simulado tambien se reporta como no viable', async () => {
    const e = crearEntorno();
    const resultado = await e.servicios.fichajes.simularFichaje(fichaje(21, 1, 9000, { simularFalloEn: 'comision' }));
    assert.equal(resultado.viable, false);
    assert.equal(resultado.error.codigo, 'FALLO_SIMULADO');
  });

  it('simular un intercambio tambien deja todo igual', async () => {
    const e = crearEntorno();
    const antes = e.almacen.instantanea();
    const resultado = await e.servicios.fichajes.simularIntercambio({ jugadorAId: 2, jugadorBId: 22, compensacion: { pagaClubId: 2, monto: 100 } });
    assert.equal(resultado.viable, true);
    assert.deepEqual(e.almacen.instantanea(), antes);
  });
});
