import { PUNTOS } from "../constants.js";

// funcion pura: recibe equipos y partidos y devuelve la tabla
// antes era un bloque de 50 lineas dentro de la ruta GET /api/tabla
export function calcularTabla(equipos, partidos) {
    const filas = new Map(
        equipos.map((e) => [e.id, { equipoId: e.id, nombre: e.nombre, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 }])
    );

    for (const p of partidos) {
        const local = filas.get(p.localId);
        const visitante = filas.get(p.visitanteId);
        if (!local || !visitante) continue;

        sumarResultado(local, p.golesLocal, p.golesVisitante);
        sumarResultado(visitante, p.golesVisitante, p.golesLocal);
    }

    return [...filas.values()].sort(ordenTabla);
}

// suma un partido a una fila desde el punto de vista de ese equipo
function sumarResultado(fila, aFavor, enContra) {
    fila.pj++;
    fila.gf += aFavor;
    fila.gc += enContra;
    fila.dg = fila.gf - fila.gc;

    if (aFavor > enContra) {
        fila.pg++;
        fila.pts += PUNTOS.victoria;
    } else if (aFavor < enContra) {
        fila.pp++;
        fila.pts += PUNTOS.derrota;
    } else {
        fila.pe++;
        fila.pts += PUNTOS.empate;
    }
}

// puntos, diferencia de gol, goles a favor y por ultimo el nombre
function ordenTabla(a, b) {
    return b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.nombre.localeCompare(b.nombre);
}
