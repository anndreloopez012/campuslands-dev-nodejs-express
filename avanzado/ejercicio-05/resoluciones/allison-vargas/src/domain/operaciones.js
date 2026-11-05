import { COMISION_AGENTE, MS_POR_DIA, VENTANA_DIAS } from '../constants/futbol.js';
import { crear } from '../errores/index.js';

export function crearOperaciones({ reloj, pausa = async () => {} }) {
  const exigir = (tx, coleccion, id, codigo, campo) => {
    const registro = tx.leer(coleccion, id);
    if (!registro) throw crear(codigo, { [campo]: id });
    return registro;
  };

  const paso = async (nombre, falloEn) => {
    await pausa(nombre);
    if (falloEn === nombre) throw crear('FALLO_SIMULADO', { paso: nombre });
  };

  const exigirDisponible = (jugador) => {
    if (!jugador.ultimoFichajeEn) return;
    const desde = new Date(new Date(jugador.ultimoFichajeEn).getTime() + VENTANA_DIAS * MS_POR_DIA);
    if (reloj() < desde) {
      throw crear('JUGADOR_RECIEN_FICHADO', {
        jugadorId: jugador.id,
        disponibleDesde: desde.toISOString(),
      });
    }
  };

  const ajustar = (tx, coleccion, id, cambiar) => {
    const actual = tx.leer(coleccion, id);
    return tx.actualizar(coleccion, id, cambiar(actual));
  };

  const movimiento = (tx, datos, ahora) => tx.insertar('movimientos', { ...datos, creadoEn: ahora });

  async function fichar(tx, { jugadorId, clubDestinoId, precio, salario, simularFalloEn }) {
    const ahora = reloj().toISOString();
    const jugador = exigir(tx, 'jugadores', jugadorId, 'JUGADOR_NO_ENCONTRADO', 'jugadorId');
    const destino = exigir(tx, 'clubes', clubDestinoId, 'CLUB_NO_ENCONTRADO', 'clubId');
    if (jugador.clubId === destino.id) {
      throw crear('MISMO_CLUB', { jugadorId: jugador.id, clubId: destino.id });
    }
    const origen = exigir(tx, 'clubes', jugador.clubId, 'CLUB_NO_ENCONTRADO', 'clubId');
    if (jugador.modalidad !== destino.modalidad) {
      throw crear('MODALIDAD_DISTINTA', { jugador: jugador.modalidad, club: destino.modalidad });
    }
    exigirDisponible(jugador);
    if (precio < jugador.valorMinimo) {
      throw crear('PRECIO_BAJO_EL_MINIMO', { precio, minimo: jugador.valorMinimo });
    }
    const agente = jugador.agenteId ? tx.leer('agentes', jugador.agenteId) : null;
    const comision = agente ? Math.ceil(precio * COMISION_AGENTE) : 0;
    const necesario = precio + comision;
    if (destino.presupuesto < necesario) {
      throw crear('PRESUPUESTO_INSUFICIENTE', {
        clubId: destino.id,
        necesario,
        disponible: destino.presupuesto,
        faltan: necesario - destino.presupuesto,
      });
    }
    if (destino.plantilla >= destino.plantillaMaxima) {
      throw crear('PLANTILLA_COMPLETA', {
        clubId: destino.id,
        plantilla: destino.plantilla,
        maxima: destino.plantillaMaxima,
      });
    }
    if (origen.plantilla <= origen.plantillaMinima) {
      throw crear('PLANTILLA_MINIMA', { clubId: origen.id, minima: origen.plantillaMinima });
    }
    await paso('validado', simularFalloEn);

    ajustar(tx, 'clubes', destino.id, (club) => ({ presupuesto: club.presupuesto - necesario }));
    await paso('debitado', simularFalloEn);

    ajustar(tx, 'clubes', origen.id, (club) => ({ presupuesto: club.presupuesto + precio }));
    await paso('acreditado', simularFalloEn);

    if (agente) ajustar(tx, 'agentes', agente.id, (actual) => ({ saldo: actual.saldo + comision }));
    await paso('comision', simularFalloEn);

    tx.actualizar('jugadores', jugador.id, {
      clubId: destino.id,
      salario: salario ?? jugador.salario,
      ultimoFichajeEn: ahora,
    });
    await paso('movido', simularFalloEn);

    ajustar(tx, 'clubes', destino.id, (club) => ({ plantilla: club.plantilla + 1 }));
    ajustar(tx, 'clubes', origen.id, (club) => ({ plantilla: club.plantilla - 1 }));
    await paso('plantillas', simularFalloEn);

    const fichaje = tx.insertar('fichajes', {
      tipo: 'fichaje',
      jugadorId: jugador.id,
      jugadorContraId: null,
      origenId: origen.id,
      destinoId: destino.id,
      precio,
      comision,
      creadoEn: ahora,
    });
    movimiento(tx, { clubId: destino.id, tipo: 'pago_fichaje', monto: -precio, fichajeId: fichaje.id }, ahora);
    movimiento(tx, { clubId: origen.id, tipo: 'cobro_fichaje', monto: precio, fichajeId: fichaje.id }, ahora);
    if (agente) {
      movimiento(tx, { clubId: destino.id, tipo: 'comision_pagada', monto: -comision, fichajeId: fichaje.id }, ahora);
      movimiento(tx, { agenteId: agente.id, tipo: 'comision_cobrada', monto: comision, fichajeId: fichaje.id }, ahora);
    }
    tx.encolar('fichaje.confirmado', { fichajeId: fichaje.id, jugadorId: jugador.id, origenId: origen.id, destinoId: destino.id });
    await paso('registrado', simularFalloEn);
    return fichaje;
  }

  async function intercambiar(tx, { jugadorAId, jugadorBId, compensacion, simularFalloEn }) {
    const ahora = reloj().toISOString();
    const a = exigir(tx, 'jugadores', jugadorAId, 'JUGADOR_NO_ENCONTRADO', 'jugadorId');
    const b = exigir(tx, 'jugadores', jugadorBId, 'JUGADOR_NO_ENCONTRADO', 'jugadorId');
    if (a.clubId === b.clubId) throw crear('JUGADORES_DEL_MISMO_CLUB', { clubId: a.clubId });
    const clubA = exigir(tx, 'clubes', a.clubId, 'CLUB_NO_ENCONTRADO', 'clubId');
    const clubB = exigir(tx, 'clubes', b.clubId, 'CLUB_NO_ENCONTRADO', 'clubId');
    if (a.modalidad !== clubB.modalidad || b.modalidad !== clubA.modalidad) {
      throw crear('MODALIDAD_DISTINTA', { jugador: a.modalidad, club: clubB.modalidad });
    }
    exigirDisponible(a);
    exigirDisponible(b);
    let pagador = null;
    let receptor = null;
    if (compensacion) {
      pagador = [clubA, clubB].find((club) => club.id === compensacion.pagaClubId);
      if (!pagador) throw crear('COMPENSACION_INVALIDA', { pagaClubId: compensacion.pagaClubId });
      receptor = pagador.id === clubA.id ? clubB : clubA;
      if (pagador.presupuesto < compensacion.monto) {
        throw crear('PRESUPUESTO_INSUFICIENTE', {
          clubId: pagador.id,
          necesario: compensacion.monto,
          disponible: pagador.presupuesto,
          faltan: compensacion.monto - pagador.presupuesto,
        });
      }
    }
    await paso('validado', simularFalloEn);

    const monto = compensacion?.monto ?? 0;
    if (compensacion) {
      ajustar(tx, 'clubes', pagador.id, (club) => ({ presupuesto: club.presupuesto - monto }));
      ajustar(tx, 'clubes', receptor.id, (club) => ({ presupuesto: club.presupuesto + monto }));
    }
    await paso('compensado', simularFalloEn);

    tx.actualizar('jugadores', a.id, { clubId: clubB.id, ultimoFichajeEn: ahora });
    await paso('movidoA', simularFalloEn);

    tx.actualizar('jugadores', b.id, { clubId: clubA.id, ultimoFichajeEn: ahora });
    await paso('movidoB', simularFalloEn);

    const fichaje = tx.insertar('fichajes', {
      tipo: 'intercambio',
      jugadorId: a.id,
      jugadorContraId: b.id,
      origenId: clubA.id,
      destinoId: clubB.id,
      precio: monto,
      comision: 0,
      creadoEn: ahora,
    });
    if (compensacion) {
      movimiento(tx, { clubId: pagador.id, tipo: 'compensacion_pagada', monto: -monto, fichajeId: fichaje.id }, ahora);
      movimiento(tx, { clubId: receptor.id, tipo: 'compensacion_cobrada', monto, fichajeId: fichaje.id }, ahora);
    }
    tx.encolar('intercambio.confirmado', { fichajeId: fichaje.id, jugadorAId: a.id, jugadorBId: b.id });
    await paso('registrado', simularFalloEn);
    return fichaje;
  }

  return { fichar, intercambiar };
}
