export function sumaDeDinero(almacen) {
  const clubes = almacen.consultar('clubes').reduce((total, club) => total + club.presupuesto, 0);
  const agentes = almacen.consultar('agentes').reduce((total, agente) => total + agente.saldo, 0);
  return clubes + agentes;
}

export function verificarInvariantes(almacen, { dineroInicial }) {
  const violaciones = [];
  const clubes = almacen.consultar('clubes');
  const jugadores = almacen.consultar('jugadores');
  const movimientos = almacen.consultar('movimientos');

  const total = sumaDeDinero(almacen);
  if (total !== dineroInicial) {
    violaciones.push({ regla: 'dinero_conservado', detalle: `esperado ${dineroInicial}, actual ${total}` });
  }

  for (const club of clubes) {
    const reales = jugadores.filter((jugador) => jugador.clubId === club.id);
    if (reales.length !== club.plantilla) {
      violaciones.push({ regla: 'plantilla_coherente', detalle: `club ${club.id}: contador ${club.plantilla}, real ${reales.length}` });
    }
    if (club.plantilla > club.plantillaMaxima || club.plantilla < club.plantillaMinima) {
      violaciones.push({ regla: 'plantilla_en_rango', detalle: `club ${club.id}: ${club.plantilla}` });
    }
    if (club.presupuesto < 0) {
      violaciones.push({ regla: 'presupuesto_no_negativo', detalle: `club ${club.id}: ${club.presupuesto}` });
    }
    if (reales.some((jugador) => jugador.modalidad !== club.modalidad)) {
      violaciones.push({ regla: 'modalidad_coherente', detalle: `club ${club.id}` });
    }
  }

  for (const jugador of jugadores) {
    if (!clubes.some((club) => club.id === jugador.clubId)) {
      violaciones.push({ regla: 'jugador_con_club', detalle: `jugador ${jugador.id}` });
    }
  }

  const porFichaje = new Map();
  for (const movimiento of movimientos) {
    porFichaje.set(movimiento.fichajeId, (porFichaje.get(movimiento.fichajeId) ?? 0) + movimiento.monto);
  }
  for (const [fichajeId, suma] of porFichaje) {
    if (suma !== 0) violaciones.push({ regla: 'libro_balanceado', detalle: `fichaje ${fichajeId}: suma ${suma}` });
  }

  return violaciones;
}
