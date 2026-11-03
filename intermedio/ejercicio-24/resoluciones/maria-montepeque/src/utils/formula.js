import AppError from "./app-error.js";

// convierte "Ca(OH)2" en { Ca: 1, O: 2, H: 2 }
// uso una pila: cada "(" abre un grupo nuevo y cada ")" lo cierra y lo multiplica
function parsearFormula(formula) {
    if (typeof formula !== "string" || formula.trim() === "") {
        throw new AppError(400, "La formula es obligatoria");
    }

    const texto = formula.trim();
    if (texto.length > 50) {
        throw new AppError(400, "La formula es demasiado larga");
    }

    // tokens: elemento (H, Ca), numero (2, 12), "(" o ")" y cualquier otra cosa
    const tokens = texto.match(/[A-Z][a-z]?|\d+|\(|\)|./g);
    const pila = [{}];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        // si despues viene un numero es el subindice, si no vale 1
        const tieneNumero = /^\d+$/.test(tokens[i + 1] || "");
        const cantidad = tieneNumero ? Number(tokens[i + 1]) : 1;

        if (tieneNumero && cantidad === 0) {
            throw new AppError(400, `Un subindice no puede ser 0 en ${texto}`);
        }

        if (/^[A-Z][a-z]?$/.test(token)) {
            const grupo = pila[pila.length - 1];
            grupo[token] = (grupo[token] || 0) + cantidad;
        } else if (token === "(") {
            pila.push({});
            continue;
        } else if (token === ")") {
            if (pila.length === 1) {
                throw new AppError(400, `Hay un ")" de mas en ${texto}`);
            }
            const grupo = pila.pop();
            if (Object.keys(grupo).length === 0) {
                throw new AppError(400, `Hay un parentesis vacio en ${texto}`);
            }
            const padre = pila[pila.length - 1];
            for (const [elemento, n] of Object.entries(grupo)) {
                padre[elemento] = (padre[elemento] || 0) + n * cantidad;
            }
        } else {
            // un numero suelto al inicio, minuscula sola o un caracter raro
            throw new AppError(400, `Caracter no valido "${token}" en ${texto}`);
        }

        // ya use el numero, me lo salto
        if (tieneNumero) i++;
    }

    if (pila.length !== 1) {
        throw new AppError(400, `Falta cerrar un "(" en ${texto}`);
    }

    return pila[0];
}

export { parsearFormula };
