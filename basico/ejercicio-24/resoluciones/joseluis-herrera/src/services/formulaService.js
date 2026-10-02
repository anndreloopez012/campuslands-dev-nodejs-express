const formulas = [
    {
        id: 1,
        nombre: "Agua",
        formula: "H2O",
        tipo: "Compuesto"
    },
    {
        id: 2,
        nombre: "Dióxido de carbono",
        formula: "CO2",
        tipo: "Compuesto"
    }
];

export const obtenerFormulas = () => {
    return formulas;
};

export const obtenerFormulaPorId = (id) => {
    return formulas.find((formula) => formula.id === id);
};

export const crearFormula = (nombre, formula, tipo) => {
    const nuevaFormula = {
        id: formulas.length + 1,
        nombre,
        formula,
        tipo
    };

    formulas.push(nuevaFormula);

    return nuevaFormula;
};

export const actualizarFormula = (id, nombre, formula, tipo) => {
    const formulaEncontrada = formulas.find(
        (formula) => formula.id === id
    );

    if (!formulaEncontrada) {
        return null;
    }

    formulaEncontrada.nombre = nombre;
    formulaEncontrada.formula = formula;
    formulaEncontrada.tipo = tipo;

    return formulaEncontrada;
};

export const eliminarFormula = (id) => {
    const indice = formulas.findIndex(
        (formula) => formula.id === id
    );

    if (indice === -1) {
        return null;
    }

    const formulaEliminada = formulas.splice(indice, 1);

    return formulaEliminada[0];
};