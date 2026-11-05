import { PUNTOS } from '../constants/futbol.js';

const filaVacia = (equipo) => ({
  equipoId: equipo.id,
  nombre: equipo.nombre,
  pj: 0,
  g: 0,
  e: 0,
  p: 0,
  gf: 0,
  gc: 0,
  dg: 0,
  pts: 0,
});

function registrar(fila, aFavor, enContra) {
  fila.pj += 1;
  fila.gf += aFavor;
  fila.gc += enContra;
  if (aFavor > enContra) {
    fila.g += 1;
    fila.pts += PUNTOS.victoria;
  } else if (aFavor === enContra) {
    fila.e += 1;
    fila.pts += PUNTOS.empate;
  } else {
    fila.p += 1;
    fila.pts += PUNTOS.derrota;
  }
}

const comparar = (a, b) =>
  b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.nombre.localeCompare(b.nombre);

export function calcularTabla(equipos, partidos) {
  const filas = new Map(equipos.map((equipo) => [equipo.id, filaVacia(equipo)]));

  for (const partido of partidos) {
    const local = filas.get(partido.localId);
    const visitante = filas.get(partido.visitanteId);
    if (!local || !visitante) continue;
    registrar(local, partido.golesLocal, partido.golesVisitante);
    registrar(visitante, partido.golesVisitante, partido.golesLocal);
  }

  return [...filas.values()]
    .map((fila) => ({ ...fila, dg: fila.gf - fila.gc }))
    .sort(comparar)
    .map((fila, indice) => ({ posicion: indice + 1, ...fila }));
}
