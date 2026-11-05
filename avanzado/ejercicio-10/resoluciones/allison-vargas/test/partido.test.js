import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AlmacenDePartidos, claveDePartido } from '../src/domain/almacen.js';
import { enfrentamientos, ranking, resumenDe } from '../src/domain/estadisticas.js';
import { parseFecha, validarFila } from '../src/validators/partido.js';
import { fila } from '../soporte/entorno.js';

const HOY = '2026-11-05';
const validar = (cambios) => validarFila(fila(cambios), { hoy: HOY });
const campos = (r) => r.errores.map((e) => e.campo);

describe('parseFecha', () => {
  it('acepta AAAA-MM-DD y DD/MM/AAAA y las lleva a ISO', () => {
    assert.equal(parseFecha('2026-03-01'), '2026-03-01');
    assert.equal(parseFecha('01/03/2026'), '2026-03-01');
    assert.equal(parseFecha('29/02/2024'), '2024-02-29');
  });

  it('rechaza fechas imposibles y formatos raros', () => {
    for (const malo of ['2026-02-30', '31/04/2026', '2026-3-1', '1/3/2026', 'ayer', '2026/03/01', '']) {
      assert.equal(parseFecha(malo), null, malo);
    }
  });
});

describe('validarFila', () => {
  it('acepta una fila correcta y calcula el ganador', () => {
    const r = validar({});
    assert.equal(r.errores, undefined);
    assert.equal(r.valor.ganador, 'local');
    assert.equal(r.valor.setsLocal, 3);
    assert.equal(r.valor.puntosLocal, 40);
  });

  it('usa valores por defecto para torneo, formato, mesa y puntos', () => {
    const r = validar({ torneo: '', mejorDe: '', mesa: undefined, puntosLocal: '', puntosVisita: '' });
    assert.equal(r.valor.torneo, 'Sin torneo');
    assert.equal(r.valor.mejorDe, 5);
    assert.equal(r.valor.mesa, null);
    assert.equal(r.valor.puntosLocal, null);
  });

  it('limpia espacios en los nombres', () => {
    assert.equal(validar({ local: '  Eva    Lara ' }).valor.local, 'Eva Lara');
  });

  it('valida fecha: real y no futura', () => {
    assert.deepEqual(campos(validar({ fecha: '2026-02-31' })), ['fecha']);
    assert.deepEqual(campos(validar({ fecha: '2027-01-01' })), ['fecha']);
    assert.deepEqual(campos(validar({ fecha: '' })), ['fecha']);
    assert.equal(validar({ fecha: HOY }).errores, undefined);
  });

  it('valida los nombres', () => {
    assert.deepEqual(campos(validar({ local: '' })), ['local']);
    assert.deepEqual(campos(validar({ local: 'E' })), ['local']);
    assert.deepEqual(campos(validar({ visita: 'eva lara' })), ['visita']);
    assert.deepEqual(campos(validar({ local: '=CMD()' })), ['local']);
    assert.deepEqual(campos(validar({ torneo: '@algo' })), ['torneo']);
  });

  it('la regla del mismo jugador ignora acentos y mayusculas', () => {
    assert.deepEqual(campos(validar({ local: 'Jos\u00E9 Paz', visita: 'JOSE PAZ' })), ['visita']);
  });

  it('valida los sets segun el formato', () => {
    const sinPuntos = { puntosLocal: '', puntosVisita: '' };
    assert.deepEqual(campos(validar({ ...sinPuntos, setsLocal: '2', setsVisita: '1' })), ['setsLocal']);
    assert.deepEqual(campos(validar({ ...sinPuntos, setsLocal: '3', setsVisita: '3' })), ['setsLocal']);
    assert.deepEqual(campos(validar({ ...sinPuntos, setsLocal: '4', setsVisita: '0' })), ['setsLocal']);
    assert.equal(validar({ mejorDe: '3', setsLocal: '2', setsVisita: '1', puntosLocal: '30', puntosVisita: '20' }).valor.mejorDe, 3);
    assert.equal(validar({ mejorDe: '7', setsLocal: '1', setsVisita: '4', puntosLocal: '30', puntosVisita: '50' }).valor.ganador, 'visita');
  });

  it('rechaza numeros con signo, decimales o texto', () => {
    assert.deepEqual(campos(validar({ setsLocal: '3.0' })), ['setsLocal']);
    assert.deepEqual(campos(validar({ setsVisita: '-1' })), ['setsVisita']);
    assert.deepEqual(campos(validar({ setsLocal: 'tres' })), ['setsLocal']);
    assert.deepEqual(campos(validar({ mejorDe: '4' })), ['mejorDe']);
    assert.deepEqual(campos(validar({ mesa: '21' })), ['mesa']);
  });

  it('exige puntos coherentes con los sets ganados', () => {
    assert.deepEqual(campos(validar({ puntosLocal: '20' })), ['puntosLocal']);
    assert.deepEqual(campos(validar({ puntosVisita: '5' })), ['puntosVisita']);
    assert.deepEqual(campos(validar({ puntosVisita: '' })), ['puntosVisita']);
  });

  it('junta todos los errores de la fila', () => {
    const r = validar({ fecha: 'x', local: '', setsLocal: 'a', puntosLocal: 'b' });
    assert.deepEqual(campos(r).sort(), ['fecha', 'local', 'puntosLocal', 'puntosVisita', 'setsLocal'].sort());
  });
});

describe('almacen y estadisticas', () => {
  const partido = (extra) => ({ ...validar({}).valor, ...extra });

  it('la clave de duplicado no depende del orden ni de acentos', () => {
    const a = claveDePartido(partido({ local: 'Jos\u00E9 Paz', visita: 'Ana Gil' }));
    const b = claveDePartido(partido({ local: 'ANA GIL', visita: 'jose paz' }));
    assert.equal(a, b);
  });

  it('registra, detecta existentes y revierte una importacion', () => {
    const almacen = new AlmacenDePartidos();
    const p = partido({});
    const imp = almacen.registrar({ resumen: { origen: 'prueba' }, partidos: [p] });
    assert.equal(imp.id, 1);
    assert.equal(almacen.existe(p), true);
    assert.equal(almacen.partidos[0].importacionId, 1);
    assert.equal(almacen.revertir(1), 1);
    assert.equal(almacen.existe(p), false);
    assert.equal(almacen.partidos.length, 0);
    assert.equal(almacen.obtenerImportacion(1).revertida, true);
  });

  const datos = [
    partido({ id: 1, local: 'Ana', visita: 'Luis', setsLocal: 3, setsVisita: 0, puntosLocal: 33, puntosVisita: 10, ganador: 'local', torneo: 'A' }),
    partido({ id: 2, local: 'Luis', visita: 'Ana', setsLocal: 3, setsVisita: 2, puntosLocal: 50, puntosVisita: 45, ganador: 'local', torneo: 'B' }),
    partido({ id: 3, local: 'Ana', visita: 'Eva', setsLocal: 1, setsVisita: 3, puntosLocal: null, puntosVisita: null, ganador: 'visita', torneo: 'A' }),
  ];

  it('ranking ordena por victorias y luego por diferencia de sets', () => {
    const r = ranking(datos);
    assert.deepEqual(r.map((x) => [x.posicion, x.nombre, x.victorias]), [[1, 'Eva', 1], [2, 'Ana', 1], [3, 'Luis', 1]]);
  });

  it('ranking filtra por torneo y minimo de partidos', () => {
    assert.deepEqual(ranking(datos, { torneo: 'a' }).map((x) => x.nombre), ['Eva', 'Ana', 'Luis']);
    assert.deepEqual(ranking(datos, { torneo: 'b' }).map((x) => x.nombre), ['Luis', 'Ana']);
    assert.deepEqual(ranking(datos, { minPartidos: 3 }).map((x) => x.nombre), ['Ana']);
    assert.equal(ranking(datos, { limite: 1 }).length, 1);
  });

  it('el resumen suma sets y puntos solo de los partidos que traen puntos', () => {
    const r = resumenDe(datos, 'ANA');
    assert.equal(r.partidos, 3);
    assert.equal(r.victorias, 1);
    assert.equal(r.setsGanados, 6);
    assert.equal(r.setsPerdidos, 6);
    assert.equal(r.puntosAFavor, 78);
    assert.equal(r.puntosEnContra, 60);
    assert.equal(resumenDe(datos, 'nadie'), null);
  });

  it('enfrentamientos cuenta victorias sin importar quien era local', () => {
    const { resultado } = enfrentamientos(datos, 'ana', 'luis');
    assert.deepEqual(resultado, {
      partidos: 2, victoriasA: 1, victoriasB: 1, setsA: 5, setsB: 3,
    });
  });
});
