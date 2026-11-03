// reglas del torneo de un shooter tactico 5v5 (estilo Valorant / CS)

export class ErrorTorneo extends Error {
    constructor(status, mensaje, errores) {
        super(mensaje);
        this.status = status;
        this.errores = errores;
    }
}

export const ROLES = ["duelista", "iniciador", "controlador", "centinela"];
export const MAPAS = ["Ascent", "Bind", "Haven", "Split", "Lotus"];

// marcador valido: el ganador llega a 13 y el otro tiene 11 o menos,
// o hubo prorroga (12-12) y se gana por 2 exactos: 14-12, 15-13...
export function marcadorValido(a, b) {
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return false;
    const [ganador, perdedor] = a > b ? [a, b] : [b, a];
    if (ganador === 13 && perdedor <= 11) return true;
    return perdedor >= 12 && ganador - perdedor === 2;
}

// elo: el favorito gana poco si gana, pierde mucho si pierde
export function nuevoElo(eloA, eloB, ganoA, k = 32) {
    const esperadoA = 1 / (1 + 10 ** ((eloB - eloA) / 400));
    const cambio = Math.round(k * ((ganoA ? 1 : 0) - esperadoA));
    return { a: eloA + cambio, b: eloB - cambio, cambio };
}

export function crearTorneo(almacen) {
    function registrarPartida(body = {}) {
        const { equipoA, equipoB, rondasA, rondasB, mapa, estadisticas = [] } = body;
        const errores = [];
        const a = almacen.buscar("equipos", equipoA);
        const b = almacen.buscar("equipos", equipoB);
        if (!a) errores.push(`equipoA ${equipoA} no existe`);
        if (!b) errores.push(`equipoB ${equipoB} no existe`);
        if (equipoA === equipoB) errores.push("un equipo no puede jugar contra si mismo");
        if (!MAPAS.includes(mapa)) errores.push(`mapa debe ser: ${MAPAS.join(", ")}`);
        if (!marcadorValido(rondasA, rondasB)) errores.push(`marcador ${rondasA}-${rondasB} imposible`);

        // las estadisticas solo pueden ser de jugadores de esos dos equipos
        for (const e of estadisticas) {
            const j = almacen.buscar("jugadores", e.jugadorId);
            if (!j || (j.equipoId !== equipoA && j.equipoId !== equipoB)) errores.push(`el jugador ${e.jugadorId} no juega en esta partida`);
        }
        if (errores.length > 0) throw new ErrorTorneo(400, "Partida invalida", errores);

        const ganoA = rondasA > rondasB;
        const elo = nuevoElo(a.elo, b.elo, ganoA);
        almacen.actualizar("equipos", a.id, { elo: elo.a, victorias: a.victorias + (ganoA ? 1 : 0), derrotas: a.derrotas + (ganoA ? 0 : 1) });
        almacen.actualizar("equipos", b.id, { elo: elo.b, victorias: b.victorias + (ganoA ? 0 : 1), derrotas: b.derrotas + (ganoA ? 1 : 0) });

        return almacen.insertar("partidas", { equipoA, equipoB, rondasA, rondasB, mapa, ganador: ganoA ? equipoA : equipoB, cambioElo: Math.abs(elo.cambio), estadisticas });
    }

    const ranking = () =>
        almacen
            .listar("equipos")
            .sort((x, y) => y.elo - x.elo || y.victorias - x.victorias || x.nombre.localeCompare(y.nombre))
            .map((e, i) => ({ puesto: i + 1, id: e.id, nombre: e.nombre, elo: e.elo, victorias: e.victorias, derrotas: e.derrotas }));

    // kills, muertes y K/D sumando todas las partidas
    function estadisticasJugador(id) {
        const jugador = almacen.buscar("jugadores", id);
        if (!jugador) throw new ErrorTorneo(404, `No existe el jugador ${id}`);
        const filas = almacen.listar("partidas").flatMap((p) => p.estadisticas.filter((e) => e.jugadorId === id));
        const kills = filas.reduce((t, e) => t + e.kills, 0);
        const muertes = filas.reduce((t, e) => t + e.muertes, 0);
        return { jugador: jugador.alias, partidas: filas.length, kills, muertes, kd: muertes === 0 ? kills : Number((kills / muertes).toFixed(2)) };
    }

    return { registrarPartida, ranking, estadisticasJugador };
}
