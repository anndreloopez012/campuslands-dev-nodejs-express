import { Transform } from "node:stream";

// parser de CSV hecho a mano (sigue el RFC 4180)
//
// por que no split(","): un campo puede tener comas, comillas y hasta saltos de linea
//   "Ma Long, CHN","dijo ""hola""","linea 1
//   linea 2"
//
// es una maquina de estados que lee caracter por caracter
// y guarda su estado entre chunks (un chunk puede cortar a la mitad de un campo)

export function crearParserCsv({ delimitador = "auto" } = {}) {
    let sep = delimitador === "auto" ? null : delimitador;
    let campo = "";
    let fila = [];
    let entreComillas = false;
    let comillaPendiente = false; // vi una " dentro de comillas: puede ser cierre o "" escapada
    let linea = 1; // linea donde empezo la fila actual
    let lineaActual = 1;
    let primerChunk = true;
    let ultimoFueCR = false;

    function terminarCampo() {
        fila.push(campo);
        campo = "";
    }

    function terminarFila(stream) {
        terminarCampo();
        // salto las filas totalmente vacias
        if (!(fila.length === 1 && fila[0] === "")) {
            stream.push({ linea, campos: fila });
        }
        fila = [];
        linea = lineaActual;
    }

    return new Transform({
        readableObjectMode: true,
        transform(chunk, _enc, listo) {
            let texto = chunk.toString("utf8");

            if (primerChunk) {
                // Excel guarda con BOM al inicio, lo quito
                if (texto.charCodeAt(0) === 0xfeff) texto = texto.slice(1);
                // detecto el separador mirando la primera linea: ; es comun en Excel en espanol
                if (!sep) {
                    const encabezado = texto.split(/\r?\n/)[0];
                    sep = (encabezado.match(/;/g) || []).length > (encabezado.match(/,/g) || []).length ? ";" : ",";
                }
                primerChunk = false;
            }

            for (const c of texto) {
                // \r\n cuenta como un solo salto
                if (ultimoFueCR && c === "\n") {
                    ultimoFueCR = false;
                    continue;
                }
                ultimoFueCR = false;

                if (comillaPendiente) {
                    comillaPendiente = false;
                    if (c === '"') {
                        // "" dentro de comillas es una comilla escrita
                        campo += '"';
                        continue;
                    }
                    // era el cierre de las comillas, sigo procesando este caracter abajo
                    entreComillas = false;
                }

                if (entreComillas) {
                    if (c === '"') {
                        comillaPendiente = true;
                    } else {
                        if (c === "\n" || c === "\r") lineaActual++;
                        ultimoFueCR = c === "\r";
                        campo += c === "\r" ? "\n" : c;
                    }
                } else if (c === '"' && campo === "") {
                    entreComillas = true;
                } else if (c === sep) {
                    terminarCampo();
                } else if (c === "\n" || c === "\r") {
                    lineaActual++;
                    ultimoFueCR = c === "\r";
                    terminarFila(this);
                } else {
                    campo += c;
                }
            }
            listo();
        },
        flush(listo) {
            if (comillaPendiente) entreComillas = false;
            if (entreComillas) {
                return listo(Object.assign(new Error(`Comillas sin cerrar en la fila que empieza en la linea ${linea}`), { status: 400 }));
            }
            if (campo !== "" || fila.length > 0) terminarFila(this);
            listo();
        }
    });
}

// "Jugador A" -> "jugador_a", "Fécha " -> "fecha"
export function normalizarEncabezado(texto) {
    return texto
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
}

// convierte las filas en objetos usando la primera fila como encabezado
export function aObjetos() {
    let columnas = null;

    return new Transform({
        objectMode: true,
        transform({ linea, campos }, _enc, listo) {
            if (!columnas) {
                columnas = campos.map(normalizarEncabezado);
                return listo();
            }
            const objeto = {};
            columnas.forEach((col, i) => (objeto[col] = (campos[i] ?? "").trim()));
            listo(null, { linea, columnas: campos.length, esperadas: columnas.length, datos: objeto, encabezado: columnas });
        }
    });
}
