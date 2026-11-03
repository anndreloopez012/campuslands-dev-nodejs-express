// liga con dos modalidades: futbol (11) y futbol sala (5)
// tabla de posiciones: 3 por ganar, 1 por empatar; desempate por diferencia de gol, goles a favor y nombre

export const MODALIDADES = {
    futbol: { jugadoresPorLado: 11, minutos: 90 },
    "futbol-sala": { jugadoresPorLado: 5, minutos: 40 }
};

export class ErrorLiga extends Error {
    constructor(status, mensaje, errores) {
        super(mensaje);
        this.status = status;
        this.errores = errores;
    }
}

export function crearLiga() {
    const equipos = {
        futbol: ["Aurora FC", "Comunicaciones", "Municipal", "Xelaju"],
        "futbol-sala": ["Glucosoral", "Bizcocho FS", "Rayo Sala", "Caja Futsal"]
    };
    const partidos = [];

    function registrar(body = {}) {
        const { modalidad, local, visitante, golesLocal, golesVisitante } = body;
        const errores = [];
        if (!Object.hasOwn(MODALIDADES, modalidad)) errores.push(`modalidad debe ser: ${Object.keys(MODALIDADES).join(", ")}`);
        const lista = equipos[modalidad] ?? [];
        if (!lista.includes(local)) errores.push(`local no es un equipo de ${modalidad}`);
        if (!lista.includes(visitante)) errores.push(`visitante no es un equipo de ${modalidad}`);
        if (local === visitante) errores.push("local y visitante deben ser distintos");
        for (const [nombre, g] of [["golesLocal", golesLocal], ["golesVisitante", golesVisitante]]) {
            if (!Number.isInteger(g) || g < 0 || g > 40) errores.push(`${nombre} debe ser un entero de 0 a 40`);
        }
        if (errores.length > 0) throw new ErrorLiga(400, "Partido invalido", errores);

        const partido = { id: partidos.length + 1, modalidad, local, visitante, golesLocal, golesVisitante };
        partidos.push(partido);
        return partido;
    }

    function tabla(modalidad) {
        if (!Object.hasOwn(MODALIDADES, modalidad)) throw new ErrorLiga(404, `No existe la modalidad ${modalidad}`);
        const filas = new Map(equipos[modalidad].map((e) => [e, { equipo: e, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 }]));
        for (const p of partidos.filter((x) => x.modalidad === modalidad)) {
            const l = filas.get(p.local);
            const v = filas.get(p.visitante);
            l.pj++;
            v.pj++;
            l.gf += p.golesLocal;
            l.gc += p.golesVisitante;
            v.gf += p.golesVisitante;
            v.gc += p.golesLocal;
            if (p.golesLocal > p.golesVisitante) [l.g, v.p, l.pts] = [l.g + 1, v.p + 1, l.pts + 3];
            else if (p.golesLocal < p.golesVisitante) [v.g, l.p, v.pts] = [v.g + 1, l.p + 1, v.pts + 3];
            else [l.e, v.e, l.pts, v.pts] = [l.e + 1, v.e + 1, l.pts + 1, v.pts + 1];
        }
        return [...filas.values()]
            .map((f) => ({ ...f, dg: f.gf - f.gc }))
            .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.equipo.localeCompare(b.equipo))
            .map((f, i) => ({ posicion: i + 1, ...f }));
    }

    return { registrar, tabla, partidos: () => partidos };
}
