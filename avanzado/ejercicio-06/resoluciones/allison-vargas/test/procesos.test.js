import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FalloDeProceso, SIN_RESPUESTA, ejecutarProceso } from '../src/domain/procesos.js';
import { planDeTrabajos, resumirOrden } from '../src/domain/ordenes.js';
import { ejecutarProcesador } from '../src/domain/procesador.js';
import { crearColaDePrueba } from '../soporte/entorno.js';

const trabajo = (tipo, carga, intentos = 1) => ({ tipo, carga, intentos });

describe('procesos del taller', () => {
  it('el diagnostico traduce sintomas en hallazgos y servicios sugeridos', () => {
    const r = ejecutarProceso(trabajo('diagnostico', { sintomas: ['ruido_motor', 'vibracion', 'luces_tenues'] }));
    assert.deepEqual(r.hallazgos, ['holgura en valvulas', 'cadena floja', 'regulador de voltaje debil']);
    assert.deepEqual(r.serviciosSugeridos, ['afinacion', 'electrica']);
    assert.equal(r.costo, 50);
  });

  it('calcula el costo de cada servicio', () => {
    assert.equal(ejecutarProceso(trabajo('cambio_aceite', { litros: 2 })).costo, 120);
    assert.equal(ejecutarProceso(trabajo('cambio_aceite', { litros: 2, sintetico: true })).costo, 190);
    assert.equal(ejecutarProceso(trabajo('frenos', { eje: 'ambos' })).costo, 300);
    assert.equal(ejecutarProceso(trabajo('afinacion', { cilindrada: 321 })).costo, 160);
    assert.equal(ejecutarProceso(trabajo('electrica', { componente: 'arranque' })).costo, 260);
    assert.equal(ejecutarProceso(trabajo('lavado', {})).costo, 40);
  });

  it('falla tantas veces como indique fallosSimulados', () => {
    const carga = { eje: 'trasero', fallosSimulados: 2 };
    assert.throws(() => ejecutarProceso(trabajo('frenos', carga, 1)), FalloDeProceso);
    assert.throws(() => ejecutarProceso(trabajo('frenos', carga, 2)), /intento 2/);
    assert.equal(ejecutarProceso(trabajo('frenos', carga, 3)).costo, 150);
  });

  it('colgar devuelve la marca de que el mecanico no responde', () => {
    assert.equal(ejecutarProceso(trabajo('lavado', { colgar: true })), SIN_RESPUESTA);
  });
});

describe('ordenes: plan y resumen', () => {
  const servicios = [{ tipo: 'frenos', eje: 'delantero' }, { tipo: 'afinacion', cilindrada: 150 }];

  it('arma diagnostico, servicios que dependen de el y lavado al final', () => {
    const plan = planDeTrabajos({ ordenId: 3, sintomas: ['vibracion'], servicios, incluirLavado: true, prioridad: 1 });
    assert.deepEqual(plan.map((p) => p.clave), ['diagnostico', 'frenos-0', 'afinacion-1', 'lavado']);
    assert.deepEqual(plan[1].dependeDe, ['diagnostico']);
    assert.deepEqual(plan[3].dependeDe, ['frenos-0', 'afinacion-1']);
    assert.deepEqual(plan[1].carga, { eje: 'delantero' });
    assert.equal(plan[3].prioridad, 3);
    assert.equal(plan[0].claveUnica, 'orden-3-diagnostico');
  });

  it('sin lavado no agrega el ultimo paso', () => {
    const plan = planDeTrabajos({ ordenId: 1, sintomas: ['vibracion'], servicios, incluirLavado: false, prioridad: 2 });
    assert.equal(plan.length, 3);
  });

  it('el estado de la orden sale de sus trabajos', () => {
    const orden = { id: 1 };
    const de = (...estados) => estados.map((estado, i) => ({ id: i + 1, estado, resultado: estado === 'completada' ? { costo: 10 } : null }));
    assert.equal(resumirOrden(orden, de('pendiente', 'bloqueada')).estado, 'en_espera');
    assert.equal(resumirOrden(orden, de('completada', 'bloqueada')).estado, 'en_proceso');
    assert.equal(resumirOrden(orden, de('en_proceso', 'bloqueada')).estado, 'en_proceso');
    assert.equal(resumirOrden(orden, de('muerta', 'cancelada')).estado, 'con_problemas');
    assert.equal(resumirOrden(orden, de('cancelada', 'cancelada')).estado, 'cancelada');
    const lista = resumirOrden(orden, de('completada', 'completada'));
    assert.equal(lista.estado, 'lista');
    assert.equal(lista.costoTotal, 20);
    assert.deepEqual(lista.progreso, { completadas: 2, total: 2 });
  });
});

describe('procesador', () => {
  const mecanicos = [
    { id: 1, nombre: 'A', habilidades: ['cambio_aceite'], capacidad: 1 },
    { id: 2, nombre: 'B', habilidades: ['cambio_aceite', 'lavado'], capacidad: 2 },
  ];

  it('reparte el trabajo segun habilidades y respeta el maximo', () => {
    const { cola } = crearColaDePrueba();
    for (let i = 0; i < 4; i += 1) cola.encolar({ tipo: 'cambio_aceite', carga: { litros: 1 } });
    const salidas = ejecutarProcesador({ cola, trabajadores: mecanicos, max: 3 });
    assert.equal(salidas.length, 3);
    assert.ok(salidas.every((s) => s.resultado === 'completada'));
    assert.equal(cola.listar({ estado: 'completada' }).length, 3);
    assert.equal(cola.listar({ estado: 'pendiente' }).length, 1);
  });

  it('un fallo simulado reprograma y un intento posterior lo completa', () => {
    const { cola, avanzar } = crearColaDePrueba();
    cola.encolar({ tipo: 'lavado', carga: { fallosSimulados: 1 } });
    const [primera] = ejecutarProcesador({ cola, trabajadores: mecanicos, max: 5 });
    assert.equal(primera.resultado, 'fallida');
    assert.equal(primera.estado, 'programada');
    avanzar(500);
    const [segunda] = ejecutarProcesador({ cola, trabajadores: mecanicos, max: 5 });
    assert.equal(segunda.resultado, 'completada');
    assert.equal(segunda.intento, 2);
  });

  it('un trabajo que cuelga al mecanico se recupera cuando vence el lease', () => {
    const { cola, avanzar } = crearColaDePrueba();
    cola.encolar({ tipo: 'lavado', carga: { colgar: true } });
    const [salida] = ejecutarProcesador({ cola, trabajadores: mecanicos, max: 5 });
    assert.equal(salida.resultado, 'sin_respuesta');
    assert.equal(cola.obtener(1).estado, 'en_proceso');
    avanzar(20000);
    assert.equal(cola.obtener(1).estado, 'programada');
    avanzar(500);
    assert.equal(cola.obtener(1).estado, 'pendiente');
  });

  it('un mecanico con cupo lleno por trabajos colgados no recibe mas', () => {
    const { cola } = crearColaDePrueba();
    cola.encolar({ tipo: 'cambio_aceite', carga: { litros: 1, colgar: true } });
    cola.encolar({ tipo: 'cambio_aceite', carga: { litros: 1 } });
    const salidas = ejecutarProcesador({ cola, trabajadores: [mecanicos[0]], max: 10 });
    assert.deepEqual(salidas.map((s) => s.resultado), ['sin_respuesta']);
    assert.equal(cola.obtener(2).estado, 'pendiente');
  });

  it('sin trabajo disponible devuelve una lista vacia', () => {
    const { cola } = crearColaDePrueba();
    assert.deepEqual(ejecutarProcesador({ cola, trabajadores: mecanicos, max: 5 }), []);
  });
});
