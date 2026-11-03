import { Transform } from "node:stream";

// igual que en el avanzado 09: junta los chunks y entrega linea por linea con su numero
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
        flush(listo) {
            if (resto.trim() !== "") this.push({ numero: numero + 1, linea: resto });
            listo();
        }
    });
}

export function limitarBytes(maximo) {
    let total = 0;
    return new Transform({
        transform(chunk, _enc, listo) {
            total += chunk.length;
            if (total > maximo) return listo(Object.assign(new Error(`El archivo pasa el maximo de ${maximo} bytes`), { status: 413 }));
            listo(null, chunk);
        }
    });
}
