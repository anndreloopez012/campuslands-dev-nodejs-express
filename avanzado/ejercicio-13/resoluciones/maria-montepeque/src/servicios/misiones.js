import { log } from "../logs/contexto.js";

// el service no recibe req ni logger: lo saca del contexto con log()
// y aun asi cada linea sale con el requestId de la peticion

export const DESTINOS = { luna: 3, marte: 210, europa: 600, titan: 1300, "agujero-negro": null };

export function crearMisiones(loggerGeneral) {
    const misiones = new Map();
    let siguienteId = 1;

    async function calcularTrayectoria(destino) {
        log(loggerGeneral).debug("calculando trayectoria", { destino });
        await new Promise((r) => setTimeout(r, 5));

        if (DESTINOS[destino] === null) {
            // bug a proposito: el calculo se rompe con este destino (para ver el log de error)
            const radio = undefined;
            return radio.horizonteDeEventos;
        }
        return { diasViaje: DESTINOS[destino], combustibleT: DESTINOS[destino] * 4 };
    }

    async function crear(body = {}) {
        const errores = [];
        if (typeof body.nave !== "string" || body.nave.trim().length < 3) errores.push("nave es obligatoria");
        if (!Object.hasOwn(DESTINOS, body.destino)) errores.push(`destino debe ser uno de: ${Object.keys(DESTINOS).join(", ")}`);
        if (!Number.isInteger(body.tripulantes) || body.tripulantes < 1 || body.tripulantes > 12) errores.push("tripulantes debe ser de 1 a 12");
        if (typeof body.codigoAcceso !== "string" || body.codigoAcceso.length < 6) errores.push("codigoAcceso debe tener 6 caracteres o mas");

        if (errores.length > 0) {
            // el body tiene codigoAcceso: el redactor lo tapa
            log(loggerGeneral).warn("mision rechazada por datos invalidos", { errores, body });
            throw Object.assign(new Error("Datos invalidos"), { status: 400, errores });
        }

        const trayectoria = await calcularTrayectoria(body.destino);
        const mision = { id: siguienteId++, nave: body.nave.trim(), destino: body.destino, tripulantes: body.tripulantes, ...trayectoria, estado: "programada" };
        misiones.set(mision.id, mision);

        log(loggerGeneral).info("mision creada", { misionId: mision.id, destino: mision.destino, diasViaje: mision.diasViaje });
        if (mision.diasViaje > 1000) {
            log(loggerGeneral).warn("mision muy larga", { misionId: mision.id, diasViaje: mision.diasViaje });
        }
        return mision;
    }

    function buscar(id) {
        const mision = misiones.get(id);
        if (!mision) {
            log(loggerGeneral).info("mision no encontrada", { misionId: id });
            throw Object.assign(new Error(`No existe la mision ${id}`), { status: 404 });
        }
        return mision;
    }

    return { crear, buscar };
}
