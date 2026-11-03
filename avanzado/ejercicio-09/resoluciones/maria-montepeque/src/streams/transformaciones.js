import { Transform, Writable } from "node:stream";

// --- de objetos a texto ---

// deja pasar solo los objetos que cumplen la condicion
export function filtrar(condicion) {
    return new Transform({
        objectMode: true,
        transform(obj, _enc, listo) {
            if (condicion(obj)) this.push(obj);
            listo();
        }
    });
}

// un objeto por linea (NDJSON)
export function aNdjson() {
    return new Transform({
        writableObjectMode: true,
        transform(obj, _enc, listo) {
            listo(null, JSON.stringify(obj) + "\n");
        }
    });
}

// CSV con encabezado en la primera fila
export function aCsv(columnas) {
    let primera = true;
    const celda = (valor) => {
        const texto = String(valor ?? "");
        // si tiene coma, comilla o salto de linea va entre comillas
        return /[",\n]/.test(texto) ? `"${texto.replaceAll('"', '""')}"` : texto;
    };

    return new Transform({
        writableObjectMode: true,
        transform(obj, _enc, listo) {
            let salida = "";
            if (primera) {
                salida += columnas.join(",") + "\n";
                primera = false;
            }
            salida += columnas.map((c) => celda(obj[c])).join(",") + "\n";
            listo(null, salida);
        }
    });
}

// --- de texto a objetos ---

// corta el error si llegan mas bytes de la cuenta
export function limitarBytes(maximo) {
    let total = 0;
    return new Transform({
        transform(chunk, _enc, listo) {
            total += chunk.length;
            if (total > maximo) {
                return listo(Object.assign(new Error(`El body pasa el maximo de ${maximo} bytes`), { status: 413 }));
            }
            listo(null, chunk);
        }
    });
}

// junta los pedazos de texto y entrega linea por linea
// un chunk puede cortar una linea a la mitad: lo que sobra se guarda para el siguiente
export function separarLineas() {
    let resto = "";
    let numero = 0;

    return new Transform({
        readableObjectMode: true,
        transform(chunk, _enc, listo) {
            const partes = (resto + chunk.toString("utf8")).split(/\r?\n/);
            resto = partes.pop();
            for (const linea of partes) {
                numero++;
                if (linea.trim() !== "") this.push({ numero, linea });
            }
            listo();
        },
        // la ultima linea puede no tener salto al final
        flush(listo) {
            if (resto.trim() !== "") this.push({ numero: numero + 1, linea: resto });
            listo();
        }
    });
}

// --- el que recibe al final ---

// junta estadisticas de golpes sin guardar todos los golpes
const TIPOS = ["jab", "cross", "hook", "uppercut", "patada", "rodilla"];

export function estadisticasGolpes() {
    const resumen = { validos: 0, invalidos: [], potenciaMax: 0, sumaPotencia: 0, porTipo: {} };

    const destino = new Writable({
        objectMode: true,
        write({ numero, linea }, _enc, listo) {
            let golpe;
            try {
                golpe = JSON.parse(linea);
            } catch {
                resumen.invalidos.push({ linea: numero, motivo: "JSON invalido" });
                return listo();
            }

            if (!TIPOS.includes(golpe.tipo) || typeof golpe.potencia !== "number" || golpe.potencia < 0 || golpe.potencia > 2000) {
                resumen.invalidos.push({ linea: numero, motivo: "tipo o potencia invalidos" });
                return listo();
            }

            resumen.validos++;
            resumen.sumaPotencia += golpe.potencia;
            resumen.potenciaMax = Math.max(resumen.potenciaMax, golpe.potencia);
            resumen.porTipo[golpe.tipo] = (resumen.porTipo[golpe.tipo] || 0) + 1;
            listo();
        }
    });

    destino.resultado = () => ({
        validos: resumen.validos,
        invalidos: resumen.invalidos.length,
        // no devuelvo miles de errores, solo los primeros
        primerosInvalidos: resumen.invalidos.slice(0, 10),
        potenciaPromedio: resumen.validos === 0 ? 0 : Math.round(resumen.sumaPotencia / resumen.validos),
        potenciaMax: resumen.potenciaMax,
        porTipo: resumen.porTipo
    });

    return destino;
}

export { TIPOS };
