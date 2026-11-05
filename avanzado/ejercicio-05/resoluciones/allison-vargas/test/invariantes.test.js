import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sumaDeDinero, verificarInvariantes } from '../src/domain/invariantes.js';
import { Almacen } from '../src/tx/almacen.js';
import { crearEntorno, fichaje } from '../soporte/entorno.js';

const base = () => ({
  clubes: [
    { id: 1, nombre: 'A', modalidad: 'futbol', presupuesto: 100, plantillaMaxima: 3, plantillaMinima: 1, plantilla: 2 },
    { id: 2, nombre: 'B', modalidad: 'futbol', presupuesto: 50, plantillaMaxima: 3, plantillaMinima: 1, plantilla: 1 },
  ],
  jugadores: [
    { id: 1, clubId: 1, modalidad: 'futbol' },
    { id: 2, clubId: 1, modalidad: 'futbol' },
    { id: 3, clubId: 2, modalidad: 'futbol' },
  ],
  agentes: [{ id: 1, saldo: 0 }],
  movimientos: [],
});

const violaciones = (iniciales, dineroInicial = 150) =>
  verificarInvariantes(new Almacen({ iniciales }), { dineroInicial }).map((v) => v.regla);

describe('invariantes', () => {
  it('un estado sano no tiene violaciones', () => {
    assert.deepEqual(violaciones(base()), []);
  });

  it('detecta dinero que aparece o desaparece', () => {
    assert.deepEqual(violaciones(base(), 151), ['dinero_conservado']);
  });

  it('detecta contadores de plantilla desfasados', () => {
    const datos = base();
    datos.clubes[0].plantilla = 3;
    assert.ok(violaciones(datos).includes('plantilla_coherente'));
  });

  it('detecta plantillas fuera de rango y presupuestos negativos', () => {
    const datos = base();
    datos.clubes[1].plantillaMinima = 2;
    datos.clubes[1].presupuesto = -1;
    const reglas = violaciones(datos, 99);
    assert.ok(reglas.includes('plantilla_en_rango'));
    assert.ok(reglas.includes('presupuesto_no_negativo'));
  });

  it('detecta jugadores sin club o con modalidad cruzada', () => {
    const datos = base();
    datos.jugadores[2].clubId = 9;
    datos.jugadores[1].modalidad = 'futsal';
    const reglas = violaciones(datos);
    assert.ok(reglas.includes('jugador_con_club'));
    assert.ok(reglas.includes('modalidad_coherente'));
  });

  it('detecta un libro desbalanceado', () => {
    const datos = base();
    datos.movimientos = [{ id: 1, fichajeId: 1, monto: -10 }, { id: 2, fichajeId: 1, monto: 9 }];
    assert.deepEqual(violaciones(datos), ['libro_balanceado']);
  });

  it('la suma de dinero incluye clubes y agentes', () => {
    const datos = base();
    datos.agentes[0].saldo = 7;
    assert.equal(sumaDeDinero(new Almacen({ iniciales: datos })), 157);
  });

  it('el estado inicial real y despues de operar sigue siendo consistente', async () => {
    const e = crearEntorno();
    assert.equal(e.servicios.auditoria.verificar().consistente, true);
    await e.servicios.fichajes.fichar(fichaje(21, 1, 9000));
    await e.servicios.fichajes.intercambiar({ jugadorAId: 2, jugadorBId: 41 });
    const informe = e.servicios.auditoria.verificar();
    assert.equal(informe.consistente, true);
    assert.equal(informe.dinero.inicial, informe.dinero.actual);
  });
});
