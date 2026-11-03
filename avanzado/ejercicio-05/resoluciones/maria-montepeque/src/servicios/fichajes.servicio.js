import { AppError, FallaSimulada } from "./errores.js";

// los pasos del fichaje, en orden
export const PASOS = ["cobrar-comprador", "pagar-vendedor", "mover-jugador", "registrar-fichaje", "anotar-movimientos"];

// simula que cada paso tarda (como si fuera una base de datos o una API)
// asi se ve el problema de dos fichajes al mismo tiempo
const esperar = () => new Promise((resolve) => setImmediate(resolve));

export function crearFichajesServicio(almacen) {
    function validarBody(body = {}) {
        const errores = [];
        if (!Number.isInteger(body.jugadorId) || body.jugadorId < 1) errores.push("jugadorId debe ser un entero positivo");
        if (!Number.isInteger(body.clubDestinoId) || body.clubDestinoId < 1) errores.push("clubDestinoId debe ser un entero positivo");
        if (!Number.isInteger(body.monto) || body.monto < 0 || body.monto > 50_000_000) errores.push("monto debe ser un entero de 0 a 50000000");
        if (errores.length > 0) {
            throw new AppError(400, "DATOS_INVALIDOS", "Revisa los datos enviados", { errores });
        }
    }

    // todo el fichaje es UNA transaccion: si algo falla, no queda nada a medias
    async function fichar(body, { simularFallo } = {}) {
        validarBody(body);
        if (simularFallo && !PASOS.includes(simularFallo)) {
            throw new AppError(400, "DATOS_INVALIDOS", `simularFallo debe ser uno de: ${PASOS.join(", ")}`);
        }

        return almacen.transaccion(async (db) => {
            const { jugadorId, clubDestinoId, monto } = body;

            // despues de cada paso: si me pidieron fallar ahi, fallo
            const paso = async (nombre) => {
                await esperar();
                if (simularFallo === nombre) throw new FallaSimulada(nombre);
            };

            // ---- revisiones (no cambian nada) ----
            const jugador = db.jugadores.find((j) => j.id === jugadorId);
            if (!jugador) throw new AppError(404, "JUGADOR_NO_ENCONTRADO", `No existe el jugador ${jugadorId}`);

            const destino = db.clubes.find((c) => c.id === clubDestinoId);
            if (!destino) throw new AppError(404, "CLUB_NO_ENCONTRADO", `No existe el club ${clubDestinoId}`);

            const origen = db.clubes.find((c) => c.id === jugador.clubId);

            if (origen.id === destino.id) {
                throw new AppError(409, "MISMO_CLUB", `${jugador.nombre} ya juega en ${destino.nombre}`);
            }
            if (origen.modalidad !== destino.modalidad) {
                throw new AppError(422, "MODALIDAD_DISTINTA", `${origen.nombre} es de ${origen.modalidad} y ${destino.nombre} de ${destino.modalidad}`);
            }

            // la revision y el cobro estan separados por un await (como en una base de datos real)
            // sin candado, otro fichaje podria colarse en medio
            await esperar();

            if (destino.presupuesto < monto) {
                throw new AppError(422, "PRESUPUESTO_INSUFICIENTE", `${destino.nombre} tiene Q${destino.presupuesto} y el fichaje cuesta Q${monto}`, {
                    presupuesto: destino.presupuesto,
                    monto
                });
            }
            if (destino.jugadorIds.length >= destino.maxPlantilla) {
                throw new AppError(422, "PLANTILLA_LLENA", `${destino.nombre} ya tiene ${destino.maxPlantilla} jugadores`, { maxPlantilla: destino.maxPlantilla });
            }

            // ---- cambios (todos en el borrador) ----
            destino.presupuesto -= monto;
            await paso("cobrar-comprador");

            origen.presupuesto += monto;
            await paso("pagar-vendedor");

            origen.jugadorIds = origen.jugadorIds.filter((id) => id !== jugador.id);
            destino.jugadorIds.push(jugador.id);
            jugador.clubId = destino.id;
            await paso("mover-jugador");

            const fichaje = {
                id: db.fichajes.length + 1,
                jugadorId: jugador.id,
                jugador: jugador.nombre,
                de: origen.nombre,
                a: destino.nombre,
                monto
            };
            db.fichajes.push(fichaje);
            await paso("registrar-fichaje");

            db.movimientos.push(
                { clubId: destino.id, tipo: "salida", monto, concepto: `fichaje ${fichaje.id}` },
                { clubId: origen.id, tipo: "entrada", monto, concepto: `fichaje ${fichaje.id}` }
            );
            await paso("anotar-movimientos");

            return fichaje;
        });
    }

    return { fichar };
}
