import { Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { crearParserCsv, aObjetos } from "../csv/parser.js";

export const COLUMNAS = ["fecha", "torneo", "jugador_a", "jugador_b", "sets_a", "sets_b"];

// revisa una fila y la convierte a un partido con tipos correctos
// ping pong al mejor de 5: el ganador tiene 3 sets y el otro 0, 1 o 2
export function validarFila({ linea, columnas, esperadas, datos }) {
    const errores = [];

    if (columnas !== esperadas) errores.push(`tiene ${columnas} columnas y deberia tener ${esperadas}`);

    const fecha = datos.fecha;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(fecha))) errores.push(`fecha "${fecha}" no es AAAA-MM-DD`);
    if (!datos.torneo) errores.push("torneo esta vacio");
    if (!datos.jugador_a || !datos.jugador_b) errores.push("faltan jugadores");
    else if (datos.jugador_a.toLowerCase() === datos.jugador_b.toLowerCase()) errores.push("un jugador no puede jugar contra si mismo");

    const setsA = /^\d+$/.test(datos.sets_a) ? Number(datos.sets_a) : NaN;
    const setsB = /^\d+$/.test(datos.sets_b) ? Number(datos.sets_b) : NaN;
    if (Number.isNaN(setsA) || Number.isNaN(setsB)) {
        errores.push("sets_a y sets_b deben ser numeros enteros");
    } else if (!((setsA === 3 && setsB < 3) || (setsB === 3 && setsA < 3))) {
        errores.push(`el marcador ${setsA}-${setsB} no es valido al mejor de 5`);
    }

    if (errores.length > 0) return { linea, errores };

    return {
        linea,
        partido: {
            fecha,
            torneo: datos.torneo,
            jugadorA: datos.jugador_a,
            jugadorB: datos.jugador_b,
            setsA,
            setsB,
            ganador: setsA > setsB ? datos.jugador_a : datos.jugador_b
        }
    };
}

// lee un CSV (cualquier stream de bytes) y devuelve partidos validos y errores
// se puede usar con un archivo (fs.createReadStream) o con el body de la peticion (req)
export async function leerPartidos(origen, { maxErrores = 50 } = {}) {
    const partidos = [];
    const errores = [];
    let encabezado = null;
    let filas = 0;

    const recolector = new Writable({
        objectMode: true,
        write(fila, _enc, listo) {
            if (!encabezado) {
                encabezado = fila.encabezado;
                const faltan = COLUMNAS.filter((c) => !encabezado.includes(c));
                if (faltan.length > 0) {
                    return listo(Object.assign(new Error(`Al CSV le faltan columnas: ${faltan.join(", ")}`), { status: 400, encabezado }));
                }
            }
            filas++;
            const resultado = validarFila(fila);
            if (resultado.partido) partidos.push(resultado.partido);
            else if (errores.length < maxErrores) errores.push(resultado);
            else errores.truncado = true;
            listo();
        }
    });

    await pipeline(origen, crearParserCsv(), aObjetos(), recolector);

    return { filas, validos: partidos.length, invalidos: filas - partidos.length, partidos, errores, erroresTruncados: Boolean(errores.truncado) };
}

// ranking: victorias y diferencia de sets
export function calcularRanking(partidos) {
    const tabla = new Map();
    const fila = (nombre) => {
        if (!tabla.has(nombre)) tabla.set(nombre, { jugador: nombre, jugados: 0, ganados: 0, perdidos: 0, setsFavor: 0, setsContra: 0 });
        return tabla.get(nombre);
    };

    for (const p of partidos) {
        const a = fila(p.jugadorA);
        const b = fila(p.jugadorB);
        a.jugados++;
        b.jugados++;
        a.setsFavor += p.setsA;
        a.setsContra += p.setsB;
        b.setsFavor += p.setsB;
        b.setsContra += p.setsA;
        if (p.ganador === p.jugadorA) {
            a.ganados++;
            b.perdidos++;
        } else {
            b.ganados++;
            a.perdidos++;
        }
    }

    return [...tabla.values()]
        .map((f) => ({ ...f, diferenciaSets: f.setsFavor - f.setsContra }))
        .sort((x, y) => y.ganados - x.ganados || y.diferenciaSets - x.diferenciaSets || x.jugador.localeCompare(y.jugador));
}
