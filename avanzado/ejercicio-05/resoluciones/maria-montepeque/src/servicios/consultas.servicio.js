import { AppError } from "./errores.js";

// solo lecturas, no necesitan transaccion
export function crearConsultas(almacen, datosIniciales) {
    // el dinero total no se crea ni se destruye: solo pasa de un club a otro
    const totalInicial = datosIniciales.clubes.reduce((s, c) => s + c.presupuesto, 0);

    function clubes() {
        return almacen.leer().clubes.map(({ jugadorIds, ...club }) => ({ ...club, jugadores: jugadorIds.length }));
    }

    function club(id) {
        const db = almacen.leer();
        const encontrado = db.clubes.find((c) => c.id === id);
        if (!encontrado) throw new AppError(404, "CLUB_NO_ENCONTRADO", `No existe el club ${id}`);

        const { jugadorIds, ...resto } = encontrado;
        return { ...resto, plantilla: db.jugadores.filter((j) => jugadorIds.includes(j.id)) };
    }

    const fichajes = () => almacen.leer().fichajes;
    const movimientos = () => almacen.leer().movimientos;

    // revisa que los datos esten sanos (las "invariantes")
    // si una transaccion se aplicara a medias, algo de esto fallaria
    function consistencia() {
        const db = almacen.leer();
        const problemas = [];

        const total = db.clubes.reduce((s, c) => s + c.presupuesto, 0);
        if (total !== totalInicial) {
            problemas.push(`el dinero total es Q${total} y deberia ser Q${totalInicial}`);
        }

        for (const c of db.clubes) {
            if (c.presupuesto < 0) problemas.push(`${c.nombre} tiene presupuesto negativo (Q${c.presupuesto})`);
        }

        for (const j of db.jugadores) {
            const enClubes = db.clubes.filter((c) => c.jugadorIds.includes(j.id));
            if (enClubes.length !== 1 || enClubes[0].id !== j.clubId) {
                problemas.push(`${j.nombre} dice clubId ${j.clubId} pero esta en [${enClubes.map((c) => c.id).join(", ")}]`);
            }
        }

        // cada fichaje tiene exactamente 2 movimientos
        for (const f of db.fichajes) {
            const suyos = db.movimientos.filter((m) => m.concepto === `fichaje ${f.id}`);
            if (suyos.length !== 2) problemas.push(`el fichaje ${f.id} tiene ${suyos.length} movimientos y deberia tener 2`);
        }

        return { consistente: problemas.length === 0, problemas, dineroTotal: total, version: almacen.version() };
    }

    return { clubes, club, fichajes, movimientos, consistencia };
}
