import { masaMolar } from "../quimica/formula.js";

export const TIPOS = ["acido", "base", "sal", "oxido", "organico"];

export function crearCompuestos() {
    const compuestos = new Map();

    function guardar({ formula, nombre, tipo, peligroso = false }) {
        // si la formula esta mal, masaMolar lanza ErrorFormula
        const { masaMolar: masa } = masaMolar(formula);
        const c = { formula, nombre: nombre.trim(), tipo, peligroso, masaMolar: masa };
        compuestos.set(formula, c);
        return c;
    }

    guardar({ formula: "H2O", nombre: "Agua", tipo: "oxido" });
    guardar({ formula: "H2SO4", nombre: "Acido sulfurico", tipo: "acido", peligroso: true });
    guardar({ formula: "Ca(OH)2", nombre: "Hidroxido de calcio", tipo: "base" });
    guardar({ formula: "NaCl", nombre: "Cloruro de sodio", tipo: "sal" });
    guardar({ formula: "C6H12O6", nombre: "Glucosa", tipo: "organico" });

    return {
        listar: (tipo) => [...compuestos.values()].filter((c) => !tipo || c.tipo === tipo),
        ver: (formula) => compuestos.get(formula) ?? null,
        existe: (formula) => compuestos.has(formula),
        guardar
    };
}
