// partidas de un battle royale: lobby, jugadores, zona que se cierra

export class ErrorPartida extends Error {
    constructor(status, mensaje) {
        super(mensaje);
        this.status = status;
    }
}

// la zona se cierra por fases: cada fase el radio baja y el dano sube
export const FASES_ZONA = [
    { fase: 1, radio: 2000, danoPorSegundo: 1, duracionSeg: 180 },
    { fase: 2, radio: 1200, danoPorSegundo: 2, duracionSeg: 150 },
    { fase: 3, radio: 600, danoPorSegundo: 5, duracionSeg: 120 },
    { fase: 4, radio: 200, danoPorSegundo: 10, duracionSeg: 90 },
    { fase: 5, radio: 0, danoPorSegundo: 20, duracionSeg: 60 }
];

// en que fase va la zona despues de X segundos de partida
export function zonaEn(segundos) {
    let acumulado = 0;
    for (const f of FASES_ZONA) {
        acumulado += f.duracionSeg;
        if (segundos < acumulado) return { ...f, terminaEnSeg: acumulado - segundos };
    }
    return { ...FASES_ZONA.at(-1), terminaEnSeg: 0 };
}

export function crearPartidas({ maxJugadores = 100 } = {}) {
    const partidas = new Map([
        [1, { id: 1, mapa: "Isla Volcan", modo: "solo", jugadores: [], estado: "lobby", inicio: null }],
        [2, { id: 2, mapa: "Ciudad Neon", modo: "escuadras", jugadores: [], estado: "lobby", inicio: null }]
    ]);

    function buscar(id) {
        const p = partidas.get(id);
        if (!p) throw new ErrorPartida(404, `No existe la partida ${id}`);
        return p;
    }

    const resumen = (p) => ({ id: p.id, mapa: p.mapa, modo: p.modo, estado: p.estado, jugadores: p.jugadores.length, maxJugadores });

    return {
        listar: () => [...partidas.values()].map(resumen),
        ver: (id) => resumen(buscar(id)),
        unirse(id, alias) {
            const p = buscar(id);
            if (typeof alias !== "string" || !/^[\w-]{3,16}$/.test(alias)) throw new ErrorPartida(400, "alias debe tener de 3 a 16 letras, numeros, _ o -");
            if (p.estado !== "lobby") throw new ErrorPartida(409, "La partida ya empezo");
            if (p.jugadores.includes(alias)) throw new ErrorPartida(409, `${alias} ya esta en la partida`);
            if (p.jugadores.length >= maxJugadores) throw new ErrorPartida(409, "La partida esta llena");
            p.jugadores.push(alias);
            return resumen(p);
        },
        iniciar(id, ahora = Date.now()) {
            const p = buscar(id);
            if (p.estado !== "lobby") throw new ErrorPartida(409, "La partida ya empezo");
            if (p.jugadores.length < 2) throw new ErrorPartida(409, "Se necesitan al menos 2 jugadores");
            Object.assign(p, { estado: "en_curso", inicio: ahora });
            return resumen(p);
        },
        zona(id, ahora = Date.now()) {
            const p = buscar(id);
            if (p.estado !== "en_curso") throw new ErrorPartida(409, "La partida no ha empezado");
            return zonaEn(Math.floor((ahora - p.inicio) / 1000));
        }
    };
}
