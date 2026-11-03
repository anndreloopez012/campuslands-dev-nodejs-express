import { MAPAS, ROLES } from "../servicios/torneo.js";

// FACTORIES: funciones que arman datos validos con valores por defecto
// - build(cambios): solo arma el objeto (no lo guarda)
// - create(cambios): lo arma y lo guarda en el almacen
// - createList(n): varios de una
// - traits: variantes con nombre ("estrella", "novato"...)
// - secuencias: cada uno sale con un numero distinto, asi no chocan nombres
// - aleatorio con semilla: mismos datos cada vez que corres los tests

// generador de numeros con semilla (mulberry32), siempre da la misma serie
export function aleatorioConSemilla(semilla) {
    let s = semilla >>> 0;
    return () => {
        s = (s + 0x6d2b79f5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const PREFIJOS = ["Team", "Club", "Clan", "Squad"];
const NOMBRES = ["Fenix", "Vortex", "Sombra", "Titan", "Nova", "Kraken", "Halcon", "Rayo"];
const ALIAS = ["shadow", "frost", "nyx", "blaze", "echo", "viper", "zeus", "kairo", "luma", "rex"];
const PAISES = ["GT", "MX", "CO", "AR", "CL", "PE", "BR"];

function crearFabrica(almacen, tabla, defecto, traits = {}) {
    let secuencia = 0;
    const build = (cambios = {}, ...nombresTraits) => {
        secuencia++;
        const base = defecto(secuencia, cambios);
        const conTraits = nombresTraits.reduce((obj, t) => {
            if (!traits[t]) throw new Error(`No existe el trait ${t} en ${tabla}`);
            return { ...obj, ...traits[t](obj) };
        }, base);
        // los cambios del test siempre ganan
        return { ...conTraits, ...cambios };
    };
    const create = (cambios = {}, ...nombresTraits) => almacen.insertar(tabla, build(cambios, ...nombresTraits));
    return {
        build,
        create,
        buildList: (n, cambios, ...t) => Array.from({ length: n }, () => build(cambios, ...t)),
        createList: (n, cambios, ...t) => Array.from({ length: n }, () => create(cambios, ...t))
    };
}

export function crearFabricas(almacen, { semilla = 42 } = {}) {
    const azar = aleatorioConSemilla(semilla);
    const elegir = (lista) => lista[Math.floor(azar() * lista.length)];
    const entre = (min, max) => min + Math.floor(azar() * (max - min + 1));

    const equipo = crearFabrica(
        almacen,
        "equipos",
        (n) => ({ nombre: `${elegir(PREFIJOS)} ${elegir(NOMBRES)} ${n}`, pais: elegir(PAISES), elo: 1500, victorias: 0, derrotas: 0 }),
        {
            favorito: () => ({ elo: 1800 }),
            debil: () => ({ elo: 1200 })
        }
    );

    // asociacion: si no le paso equipoId, crea un equipo para el jugador
    const jugadorBase = crearFabrica(
        almacen,
        "jugadores",
        (n, cambios) => ({
            alias: `${elegir(ALIAS)}${n}`,
            rol: elegir(ROLES),
            edad: entre(17, 28),
            equipoId: cambios.equipoId ?? null
        }),
        {
            estrella: () => ({ rol: "duelista", destacado: true }),
            capitan: () => ({ rol: "controlador", capitan: true })
        }
    );
    const jugador = {
        ...jugadorBase,
        create(cambios = {}, ...t) {
            const equipoId = cambios.equipoId ?? equipo.create().id;
            return jugadorBase.create({ ...cambios, equipoId }, ...t);
        },
        createList(n, cambios = {}, ...t) {
            const equipoId = cambios.equipoId ?? equipo.create().id;
            return jugadorBase.createList(n, { ...cambios, equipoId }, ...t);
        }
    };

    // equipo con sus 5 jugadores, el primero es capitan
    function equipoCompleto(cambios = {}, ...traits) {
        const e = equipo.create(cambios, ...traits);
        const jugadores = [jugador.create({ equipoId: e.id }, "capitan"), ...jugador.createList(4, { equipoId: e.id })];
        return { ...e, jugadores };
    }

    // body de partida valido (no la guarda: para eso esta el servicio)
    function partidaBody(cambios = {}) {
        const equipoA = cambios.equipoA ?? equipo.create().id;
        const equipoB = cambios.equipoB ?? equipo.create().id;
        const perdedor = entre(3, 11);
        const ganaA = azar() < 0.5;
        return { equipoA, equipoB, mapa: elegir(MAPAS), rondasA: ganaA ? 13 : perdedor, rondasB: ganaA ? perdedor : 13, estadisticas: [], ...cambios };
    }

    return { equipo, jugador, equipoCompleto, partidaBody, azar };
}
