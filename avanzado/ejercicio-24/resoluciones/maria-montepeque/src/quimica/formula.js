// masas atomicas (g/mol) de los elementos que usamos
export const ELEMENTOS = {
    H: 1.008, He: 4.003, Li: 6.94, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Na: 22.99,
    Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, K: 39.098, Ca: 40.078,
    Fe: 55.845, Cu: 63.546, Zn: 65.38, Br: 79.904, Ag: 107.868, I: 126.904, Au: 196.967
};

export class ErrorFormula extends Error {}

// "Ca(OH)2" -> { Ca: 1, O: 2, H: 2 }
// lee de izquierda a derecha con una pila para los parentesis
export function parsearFormula(formula) {
    if (typeof formula !== "string" || formula.length === 0 || formula.length > 60) throw new ErrorFormula("La formula debe ser un texto de 1 a 60 caracteres");

    const pila = [{}];
    let i = 0;
    const leerNumero = () => {
        const m = /^\d+/.exec(formula.slice(i));
        if (!m) return 1;
        i += m[0].length;
        if (Number(m[0]) < 1) throw new ErrorFormula(`Subindice invalido en la posicion ${i}`);
        return Number(m[0]);
    };
    const sumar = (destino, simbolo, cantidad) => {
        destino[simbolo] = (destino[simbolo] ?? 0) + cantidad;
    };

    while (i < formula.length) {
        const c = formula[i];
        if (c === "(") {
            pila.push({});
            i++;
        } else if (c === ")") {
            if (pila.length === 1) throw new ErrorFormula(`Parentesis ")" sin abrir en la posicion ${i}`);
            i++;
            const grupo = pila.pop();
            const veces = leerNumero();
            for (const [s, n] of Object.entries(grupo)) sumar(pila.at(-1), s, n * veces);
        } else if (/[A-Z]/.test(c)) {
            const simbolo = /^[A-Z][a-z]?/.exec(formula.slice(i))[0];
            if (!Object.hasOwn(ELEMENTOS, simbolo)) throw new ErrorFormula(`Elemento desconocido: ${simbolo}`);
            i += simbolo.length;
            sumar(pila.at(-1), simbolo, leerNumero());
        } else {
            throw new ErrorFormula(`Caracter invalido "${c}" en la posicion ${i}`);
        }
    }
    if (pila.length !== 1) throw new ErrorFormula("Falta cerrar un parentesis");
    return pila[0];
}

export function masaMolar(formula) {
    const atomos = parsearFormula(formula);
    const detalle = Object.entries(atomos).map(([simbolo, cantidad]) => ({
        simbolo,
        cantidad,
        aporte: Number((ELEMENTOS[simbolo] * cantidad).toFixed(3))
    }));
    const total = detalle.reduce((t, d) => t + ELEMENTOS[d.simbolo] * d.cantidad, 0);
    return { formula, atomos, masaMolar: Number(total.toFixed(3)), unidad: "g/mol", detalle };
}
