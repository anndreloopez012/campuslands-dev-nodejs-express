const ATOMIC_MASS = {
    H: 1.008, C: 12.011, N: 14.007, O: 15.999, Na: 22.99, Mg: 24.305, S: 32.06,
    Cl: 35.45, K: 39.098, Ca: 40.078, Fe: 55.845, Cu: 63.546, Zn: 65.38, Ag: 107.87,
};

const TOKEN = /([A-Z][a-z]?)(\d*)|(\()|(\))(\d*)/g;

function parseFormula(formula) {
    if (typeof formula !== "string" || !formula.trim()) throw new Error("formula es obligatoria");

    const clean = formula.replace(/\s+/g, "");
    const stack = [{}];
    let consumed = 0;

    for (const [token, element, count, open, close, groupCount] of clean.matchAll(TOKEN)) {
        consumed += token.length;
        const top = stack[stack.length - 1];

        if (open) {
            stack.push({});
        } else if (close) {
            if (stack.length === 1) throw new Error("formula con parentesis desbalanceados");
            const group = stack.pop();
            const factor = Number(groupCount || 1);
            const parent = stack[stack.length - 1];
            for (const [symbol, qty] of Object.entries(group)) parent[symbol] = (parent[symbol] ?? 0) + qty * factor;
        } else {
            if (!(element in ATOMIC_MASS)) throw new Error(`elemento desconocido: ${element}`);
            top[element] = (top[element] ?? 0) + Number(count || 1);
        }
    }

    if (consumed !== clean.length) throw new Error("formula con caracteres invalidos");
    if (stack.length !== 1) throw new Error("formula con parentesis desbalanceados");

    const elements = stack[0];
    const molarMass = Object.entries(elements).reduce((sum, [symbol, qty]) => sum + ATOMIC_MASS[symbol] * qty, 0);

    return { formula: clean, elements, molarMass: Math.round(molarMass * 1000) / 1000 };
}

export { parseFormula };
