// draft de un MOBA: los equipos azul y rojo banean y eligen heroes por turnos
// las reglas (cuantos bans, cuantos picks, cuanto dura un turno) salen de la config

const HEROES_BASE = ["Aurora", "Brakk", "Cyra", "Draven", "Eldra", "Fang", "Gorr", "Hexa", "Ivo", "Jinxa", "Korr", "Lumi", "Morg", "Nyra", "Orin", "Pyra"];
const HEROES_NUEVOS = ["Quill", "Rhea"];

export class ErrorDraft extends Error {
    constructor(status, mensaje) {
        super(mensaje);
        this.status = status;
    }
}

// orden de turnos: bans alternados, luego picks alternados (empieza azul)
export function ordenTurnos(bans, picks) {
    const turnos = [];
    for (let i = 0; i < bans * 2; i++) turnos.push({ equipo: i % 2 === 0 ? "azul" : "rojo", tipo: "ban" });
    for (let i = 0; i < picks * 2; i++) turnos.push({ equipo: i % 2 === 0 ? "azul" : "rojo", tipo: "pick" });
    return turnos;
}

export function crearDrafts(config, { reloj = Date.now } = {}) {
    const drafts = new Map();
    let siguienteId = 1;

    const heroes = () => (config.funciones.heroesNuevos ? [...HEROES_BASE, ...HEROES_NUEVOS] : HEROES_BASE);

    function crear() {
        const draft = {
            id: siguienteId++,
            region: config.region,
            turnos: ordenTurnos(config.draft.bansPorEquipo, config.draft.tamanoEquipo),
            acciones: [],
            venceEn: reloj() + config.draft.tiempoTurno
        };
        drafts.set(draft.id, draft);
        return estado(draft);
    }

    function estado(d) {
        const usados = d.acciones.map((a) => a.heroe);
        const de = (equipo, tipo) => d.acciones.filter((a) => a.equipo === equipo && a.tipo === tipo).map((a) => a.heroe);
        const turno = d.turnos[d.acciones.length] ?? null;
        return {
            id: d.id,
            region: d.region,
            terminado: turno === null,
            turnoActual: turno && { ...turno, numero: d.acciones.length + 1, segundosRestantes: Math.max(0, Math.ceil((d.venceEn - reloj()) / 1000)) },
            azul: { bans: de("azul", "ban"), picks: de("azul", "pick") },
            rojo: { bans: de("rojo", "ban"), picks: de("rojo", "pick") },
            disponibles: heroes().filter((h) => !usados.includes(h))
        };
    }

    function buscar(id) {
        const d = drafts.get(id);
        if (!d) throw new ErrorDraft(404, `No existe el draft ${id}`);
        return d;
    }

    function accion(id, { equipo, tipo, heroe } = {}) {
        const d = buscar(id);
        const turno = d.turnos[d.acciones.length];
        if (!turno) throw new ErrorDraft(409, "El draft ya termino");
        if (reloj() > d.venceEn) throw new ErrorDraft(409, `Se acabo el tiempo del turno (${config.draft.tiempoTurno / 1000}s)`);
        if (equipo !== turno.equipo || tipo !== turno.tipo) throw new ErrorDraft(409, `Ahora le toca al equipo ${turno.equipo} hacer ${turno.tipo}`);
        if (!heroes().includes(heroe)) throw new ErrorDraft(400, `El heroe ${heroe} no existe o no esta habilitado`);
        if (d.acciones.some((a) => a.heroe === heroe)) throw new ErrorDraft(409, `${heroe} ya fue baneado o elegido`);

        d.acciones.push({ equipo, tipo, heroe });
        d.venceEn = reloj() + config.draft.tiempoTurno;
        return estado(d);
    }

    return { crear, accion, ver: (id) => estado(buscar(id)), heroes };
}
