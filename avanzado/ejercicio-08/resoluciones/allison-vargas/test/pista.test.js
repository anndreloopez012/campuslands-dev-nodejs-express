import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import circuitos from '../src/data/circuitos.json' with { type: 'json' };
import { BusDeEventos } from '../src/domain/bus.js';
import { Buzones } from '../src/domain/buzones.js';
import { Records } from '../src/domain/records.js';
import { Sesiones } from '../src/domain/sesiones.js';
import { SESION_BASE, VUELTA_BASE, crearEntorno, rechazaCon } from '../soporte/entorno.js';

const eventosDe = (servicios, filtro = {}) => servicios.bus.consultar({ limite: 100, ...filtro }).data.map((e) => e.evento);

describe('sesiones de pista', () => {
  it('crear una sesion anuncia sesion:iniciada', () => {
    const { servicios } = crearEntorno();
    const sesion = servicios.sesiones.crear(SESION_BASE);
    assert.equal(sesion.estado, 'en_pista');
    assert.equal(sesion.autoNombre, 'Rimac Nevera');
    assert.deepEqual(eventosDe(servicios), ['sesion:iniciada']);
  });

  it('cada vuelta se anota y anuncia vuelta:completada', () => {
    const { servicios } = crearEntorno();
    servicios.sesiones.crear(SESION_BASE);
    servicios.sesiones.registrarVuelta(1, VUELTA_BASE);
    const sesion = servicios.sesiones.registrarVuelta(1, { ...VUELTA_BASE, tiempoMs: 88000 });
    assert.deepEqual(sesion.vueltas.map((v) => v.vuelta), [1, 2]);
    assert.equal(sesion.mejorVueltaMs, 88000);
    assert.equal(eventosDe(servicios).filter((e) => e === 'vuelta:completada').length, 2);
  });

  it('finalizar cierra la sesion y no admite mas vueltas', () => {
    const { servicios } = crearEntorno();
    servicios.sesiones.crear(SESION_BASE);
    servicios.sesiones.registrarVuelta(1, VUELTA_BASE);
    const cerrada = servicios.sesiones.finalizar(1, {});
    assert.deepEqual([cerrada.estado, cerrada.motivo], ['finalizada', 'finalizada por el piloto']);
    assert.throws(() => servicios.sesiones.registrarVuelta(1, VUELTA_BASE), rechazaCon('SESION_CERRADA', { estado: 'finalizada' }));
    assert.throws(() => servicios.sesiones.abortar(1, {}), rechazaCon('SESION_CERRADA'));
    assert.throws(() => servicios.sesiones.obtener(9), rechazaCon('SESION_NO_ENCONTRADA', { sesionId: 9 }));
    const cierre = servicios.bus.consultar({ evento: 'sesion:finalizada' }).data[0];
    assert.deepEqual(cierre.datos, { sesionId: 1, vueltas: 1, mejorVueltaMs: 90000, motivo: 'finalizada por el piloto' });
  });

  it('al llegar al maximo de vueltas se finaliza sola', () => {
    const { servicios } = crearEntorno({ limites: { maxPorEvento: 15, profundidadMaxima: 6, capacidadHistorial: 500, maxBuzones: 20, maxVueltas: 3 } });
    servicios.sesiones.crear(SESION_BASE);
    for (let i = 0; i < 3; i += 1) servicios.sesiones.registrarVuelta(1, VUELTA_BASE);
    const sesion = servicios.sesiones.obtener(1);
    assert.deepEqual([sesion.estado, sesion.motivo], ['finalizada', 'limite de vueltas']);
  });

  it('abortar guarda el motivo recibido o uno por defecto', () => {
    const { servicios } = crearEntorno();
    servicios.sesiones.crear(SESION_BASE);
    servicios.sesiones.crear(SESION_BASE);
    assert.equal(servicios.sesiones.abortar(1, { motivo: 'bandera roja' }).motivo, 'bandera roja');
    assert.equal(servicios.sesiones.abortar(2, {}).motivo, 'abortada por el equipo');
  });
});

describe('reacciones a los eventos', () => {
  it('una vuelta rapida rompe el record del circuito y lo anuncia', () => {
    const { servicios } = crearEntorno();
    servicios.sesiones.crear(SESION_BASE);
    servicios.sesiones.registrarVuelta(1, { ...VUELTA_BASE, tiempoMs: 83000 });
    const [record] = servicios.bus.consultar({ evento: 'record:nuevo' }).data;
    assert.deepEqual(record.datos, {
      sesionId: 1, circuitoId: 2, tiempoMs: 83000, anteriorMs: 84000, piloto: 'Lena Ortiz', auto: 'nevera', vuelta: 1,
    });
    assert.equal(servicios.catalogo.records().find((r) => r.circuitoId === 2).tiempoMs, 83000);
    servicios.sesiones.registrarVuelta(1, { ...VUELTA_BASE, tiempoMs: 83000 });
    assert.equal(servicios.bus.consultar({ evento: 'record:nuevo' }).data.length, 1);
  });

  it('una vuelta lenta no toca el record', () => {
    const { servicios } = crearEntorno();
    servicios.sesiones.crear(SESION_BASE);
    servicios.sesiones.registrarVuelta(1, VUELTA_BASE);
    assert.equal(servicios.catalogo.records().find((r) => r.circuitoId === 2).tiempoMs, 84000);
  });

  it('el motor caliente avisa y a la segunda vuelta seguida aborta la sesion', () => {
    const { servicios } = crearEntorno();
    servicios.sesiones.crear(SESION_BASE);
    const primera = servicios.sesiones.registrarVuelta(1, { ...VUELTA_BASE, tempMotor: 125 });
    assert.equal(primera.estado, 'en_pista');
    const segunda = servicios.sesiones.registrarVuelta(1, { ...VUELTA_BASE, tempMotor: 130 });
    assert.deepEqual([segunda.estado, segunda.motivo], ['abortada', 'sobrecalentamiento del motor']);
    const avisos = servicios.bus.consultar({ evento: 'motor:sobrecalentado' }).data.map((e) => e.datos.consecutivos);
    assert.deepEqual(avisos, [1, 2]);
  });

  it('una vuelta con temperatura normal reinicia la cuenta', () => {
    const { servicios } = crearEntorno();
    servicios.sesiones.crear(SESION_BASE);
    for (const tempMotor of [125, 100, 125]) servicios.sesiones.registrarVuelta(1, { ...VUELTA_BASE, tempMotor });
    assert.equal(servicios.sesiones.obtener(1).estado, 'en_pista');
  });

  it('el desgaste alto avisa una sola vez por sesion', () => {
    const { servicios } = crearEntorno();
    servicios.sesiones.crear(SESION_BASE);
    for (const desgaste of [50, 82, 90]) servicios.sesiones.registrarVuelta(1, { ...VUELTA_BASE, desgaste });
    const avisos = servicios.bus.consultar({ evento: 'neumaticos:desgastados' }).data;
    assert.equal(avisos.length, 1);
    assert.equal(avisos[0].datos.vuelta, 2);
  });

  it('los eventos se encadenan en orden causal', () => {
    const { servicios } = crearEntorno();
    servicios.sesiones.crear(SESION_BASE);
    servicios.sesiones.registrarVuelta(1, { tiempoMs: 83000, tempMotor: 125, desgaste: 90 });
    assert.deepEqual(eventosDe(servicios), [
      'sesion:iniciada',
      'vuelta:completada',
      'motor:sobrecalentado',
      'neumaticos:desgastados',
      'record:nuevo',
    ]);
  });

  it('despues de abortar no se anuncian mas avisos de esa vuelta', () => {
    const { servicios } = crearEntorno();
    servicios.sesiones.crear(SESION_BASE);
    servicios.sesiones.registrarVuelta(1, { ...VUELTA_BASE, tempMotor: 125, desgaste: 90 });
    servicios.sesiones.registrarVuelta(1, { ...VUELTA_BASE, tempMotor: 125, desgaste: 95 });
    assert.equal(servicios.bus.consultar({ evento: 'neumaticos:desgastados' }).data.length, 1);
    assert.deepEqual(eventosDe(servicios).slice(-2), ['motor:sobrecalentado', 'sesion:abortada']);
  });

  it('los umbrales se pueden cambiar', () => {
    const { servicios } = crearEntorno({ umbrales: { temperatura: 90, alertasParaAbortar: 1, desgaste: 80 } });
    servicios.sesiones.crear(SESION_BASE);
    assert.equal(servicios.sesiones.registrarVuelta(1, { ...VUELTA_BASE, tempMotor: 95 }).estado, 'abortada');
  });

  it('un listener externo que falla no estropea la sesion', () => {
    const { servicios } = crearEntorno();
    servicios.bus.suscribir('vuelta:completada', () => { throw new Error('boom'); }, { nombre: 'externo', alPrincipio: true });
    servicios.sesiones.crear(SESION_BASE);
    const sesion = servicios.sesiones.registrarVuelta(1, { ...VUELTA_BASE, tiempoMs: 83000 });
    assert.equal(sesion.vueltas.length, 1);
    assert.equal(servicios.bus.consultar({ evento: 'record:nuevo' }).data.length, 1);
    assert.equal(servicios.bus.fallos().length, 1);
  });
});

describe('buzones', () => {
  it('guardan los eventos que piden y respetan la capacidad', () => {
    const { servicios } = crearEntorno();
    servicios.buzones.crear({ nombre: 'vueltas', eventos: ['vuelta:completada'], capacidad: 2 });
    servicios.sesiones.crear(SESION_BASE);
    for (let i = 0; i < 3; i += 1) servicios.sesiones.registrarVuelta(1, VUELTA_BASE);
    const buzon = servicios.buzones.obtener(1);
    assert.deepEqual([buzon.recibidos, buzon.descartados, buzon.guardados], [3, 1, 2]);
    assert.deepEqual(buzon.eventosGuardados.map((e) => e.datos.vuelta), [2, 3]);
  });

  it('un buzon puede escuchar varios eventos y el comodin', () => {
    const { servicios } = crearEntorno();
    servicios.buzones.crear({ nombre: 'todo', eventos: ['*'] });
    servicios.sesiones.crear(SESION_BASE);
    servicios.sesiones.registrarVuelta(1, VUELTA_BASE);
    assert.equal(servicios.buzones.obtener(1).recibidos, 2);
  });

  it('unaVez captura un solo evento por cada tipo y luego queda inactivo', () => {
    const { servicios } = crearEntorno();
    servicios.buzones.crear({ nombre: 'primera', eventos: ['vuelta:completada'], unaVez: true });
    servicios.sesiones.crear(SESION_BASE);
    servicios.sesiones.registrarVuelta(1, VUELTA_BASE);
    servicios.sesiones.registrarVuelta(1, VUELTA_BASE);
    const buzon = servicios.buzones.obtener(1);
    assert.deepEqual([buzon.recibidos, buzon.activo], [1, false]);
  });

  it('alPrincipio recibe antes que los buzones anteriores', () => {
    const { servicios } = crearEntorno();
    servicios.buzones.crear({ nombre: 'normal', eventos: ['sesion:iniciada'] });
    servicios.buzones.crear({ nombre: 'urgente', eventos: ['sesion:iniciada'], alPrincipio: true });
    servicios.sesiones.crear(SESION_BASE);
    const orden = servicios.sistema.suscripciones({ evento: 'sesion:iniciada' }).map((s) => s.nombre);
    assert.deepEqual(orden, ['buzon:normal', 'buzon:urgente']);
    assert.equal(servicios.buzones.obtener(2).recibidos, 1);
  });

  it('un buzon con fallo simulado no afecta a los demas y deja constancia', () => {
    const { servicios } = crearEntorno();
    servicios.buzones.crear({ nombre: 'roto', eventos: ['sesion:iniciada'], simularFallo: true, alPrincipio: true });
    servicios.buzones.crear({ nombre: 'sano', eventos: ['sesion:iniciada'] });
    servicios.sesiones.crear(SESION_BASE);
    assert.equal(servicios.buzones.obtener(2).recibidos, 1);
    assert.equal(servicios.buzones.obtener(1).recibidos, 0);
    assert.match(servicios.sistema.fallos()[0].mensaje, /fallo a proposito/);
  });

  it('eliminar quita sus suscripciones y vaciar solo limpia lo guardado', () => {
    const { servicios } = crearEntorno();
    servicios.buzones.crear({ nombre: 'a', eventos: ['sesion:iniciada', 'sesion:abortada'] });
    servicios.sesiones.crear(SESION_BASE);
    assert.equal(servicios.buzones.vaciar(1).guardados, 0);
    assert.equal(servicios.buzones.obtener(1).recibidos, 1);
    const antes = servicios.sistema.suscripciones().length;
    servicios.buzones.eliminar(1);
    assert.equal(servicios.sistema.suscripciones().length, antes - 2);
    assert.throws(() => servicios.buzones.obtener(1), rechazaCon('BUZON_NO_ENCONTRADO', { buzonId: 1 }));
    assert.throws(() => servicios.buzones.eliminar(1), rechazaCon('BUZON_NO_ENCONTRADO'));
  });

  it('si no cabe en algun evento no deja suscripciones a medias', () => {
    const { servicios } = crearEntorno({ limites: { maxPorEvento: 2, profundidadMaxima: 6, capacidadHistorial: 500, maxBuzones: 20, maxVueltas: 50 } });
    servicios.buzones.crear({ nombre: 'uno', eventos: ['sesion:finalizada'] });
    servicios.buzones.crear({ nombre: 'otro', eventos: ['sesion:finalizada'] });
    const antes = servicios.sistema.suscripciones().length;
    assert.throws(
      () => servicios.buzones.crear({ nombre: 'dos', eventos: ['record:nuevo', 'sesion:finalizada', 'sesion:abortada'] }),
      rechazaCon('LIMITE_DE_SUSCRIPTORES', { evento: 'sesion:finalizada' }),
    );
    assert.equal(servicios.sistema.suscripciones().length, antes);
    assert.equal(servicios.buzones.listar().length, 2);
  });

  it('hay un maximo de buzones', () => {
    const bus = new BusDeEventos();
    const buzones = new Buzones({ bus, maximo: 2 });
    buzones.crear({ nombre: 'a', eventos: ['sesion:iniciada'] });
    buzones.crear({ nombre: 'b', eventos: ['sesion:iniciada'] });
    assert.throws(() => buzones.crear({ nombre: 'c', eventos: ['sesion:iniciada'] }), rechazaCon('LIMITE_DE_BUZONES', { maximo: 2 }));
  });
});

describe('records y sesiones sueltas', () => {
  it('los records arrancan con la marca del circuito', () => {
    const records = new Records(circuitos);
    assert.equal(records.actual(1).tiempoMs, 410000);
    assert.equal(records.actual(99), null);
    assert.equal(records.todos().length, 5);
  });

  it('sesiones sin catalogo de autos muestra autoNombre nulo', () => {
    const bus = new BusDeEventos();
    const sesiones = new Sesiones({ bus, autos: [] });
    assert.equal(sesiones.crear(SESION_BASE).autoNombre, null);
    assert.equal(sesiones.listar({ estado: 'finalizada' }).length, 0);
    assert.equal(sesiones.listar({ circuitoId: 2 }).length, 1);
  });
});
