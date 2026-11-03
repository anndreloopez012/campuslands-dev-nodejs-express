import { CLASES, ganarExperiencia, MONSTRUOS, OBJETOS, pelear, statsTotales } from "../juego/reglas.js";

export class ErrorJuego extends Error {
    constructor(status, mensaje, errores) {
        super(mensaje);
        this.status = status;
        this.errores = errores;
    }
}

export function crearServicioPersonajes(repo, { aleatorio = Math.random } = {}) {
    const buscarEn = (datos, id) => {
        const p = datos.personajes.find((x) => x.id === id);
        if (!p) throw new ErrorJuego(404, `No existe el personaje ${id}`);
        return p;
    };

    const conStats = (p) => ({ ...p, stats: statsTotales(p) });

    async function listar() {
        const datos = await repo.leer();
        return datos.personajes.map(conStats);
    }

    async function ver(id) {
        return conStats(buscarEn(await repo.leer(), id));
    }

    async function crear(body = {}) {
        const errores = [];
        if (typeof body.nombre !== "string" || !/^[\p{L}0-9 ]{3,20}$/u.test(body.nombre.trim())) errores.push("nombre debe tener de 3 a 20 letras o numeros");
        if (!Object.hasOwn(CLASES, body.clase)) errores.push(`clase debe ser: ${Object.keys(CLASES).join(", ")}`);
        if (errores.length > 0) throw new ErrorJuego(400, "Datos invalidos", errores);

        return repo.modificar((datos) => {
            const nombre = body.nombre.trim();
            if (datos.personajes.some((p) => p.nombre.toLowerCase() === nombre.toLowerCase())) throw new ErrorJuego(409, `Ya existe un personaje llamado ${nombre}`);
            const base = CLASES[body.clase];
            const personaje = { id: datos.siguienteId++, nombre, clase: body.clase, nivel: 1, experiencia: 0, vidaMax: base.vida, ataque: base.ataque, defensa: base.defensa, equipo: [], victorias: 0, derrotas: 0 };
            datos.personajes.push(personaje);
            return conStats(personaje);
        });
    }

    async function equipar(id, objeto) {
        if (!Object.hasOwn(OBJETOS, objeto)) throw new ErrorJuego(400, `No existe el objeto ${objeto}`);
        return repo.modificar((datos) => {
            const p = buscarEn(datos, id);
            if (!OBJETOS[objeto].clases.includes(p.clase)) throw new ErrorJuego(422, `Un ${p.clase} no puede usar ${objeto}`);
            if (p.equipo.includes(objeto)) throw new ErrorJuego(409, `${p.nombre} ya tiene ${objeto}`);
            if (p.equipo.length >= 2) throw new ErrorJuego(422, "Solo se pueden equipar 2 objetos");
            p.equipo.push(objeto);
            return conStats(p);
        });
    }

    async function batalla(id, monstruo) {
        if (!Object.hasOwn(MONSTRUOS, monstruo)) throw new ErrorJuego(400, `No existe el monstruo ${monstruo}`);
        return repo.modificar((datos) => {
            const p = buscarEn(datos, id);
            const nivelAntes = p.nivel;
            const resultado = pelear(p, MONSTRUOS[monstruo], aleatorio);
            let actualizado = p;
            if (resultado.gano) {
                actualizado = ganarExperiencia(p, MONSTRUOS[monstruo].xp);
                actualizado.victorias++;
            } else {
                actualizado = { ...p, derrotas: p.derrotas + 1 };
            }
            Object.assign(p, actualizado);
            return { gano: resultado.gano, turnos: resultado.turnos.length, detalle: resultado.turnos, personaje: conStats(p), subioNivel: p.nivel > nivelAntes };
        });
    }

    return { listar, ver, crear, equipar, batalla };
}
