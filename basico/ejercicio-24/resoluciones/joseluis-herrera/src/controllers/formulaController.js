import {
    obtenerFormulas,
    obtenerFormulaPorId,
    crearFormula,
    actualizarFormula,
    eliminarFormula
} from "../services/formulaService.js";

export const listarFormulas = (req, res) => {
    const formulas = obtenerFormulas();

    res.json(formulas);
};

export const buscarFormula = (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const formula = obtenerFormulaPorId(id);

    if (!formula) {
        return res.status(404).json({
            mensaje: "Fórmula química no encontrada"
        });
    }

    res.json(formula);
};

export const registrarFormula = (req, res) => {
    const { nombre, formula, tipo } = req.body;

    if (!nombre || !formula || !tipo) {
        return res.status(400).json({
            mensaje: "Nombre, fórmula y tipo son obligatorios"
        });
    }

    if (
        typeof nombre !== "string" ||
        typeof formula !== "string" ||
        typeof tipo !== "string"
    ) {
        return res.status(400).json({
            mensaje: "Todos los campos deben ser texto"
        });
    }

    const nuevaFormula = crearFormula(
        nombre,
        formula,
        tipo
    );

    res.status(201).json({
        mensaje: "Fórmula creada correctamente",
        formula: nuevaFormula
    });
};

export const modificarFormula = (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const { nombre, formula, tipo } = req.body;

    if (!nombre || !formula || !tipo) {
        return res.status(400).json({
            mensaje: "Nombre, fórmula y tipo son obligatorios"
        });
    }

    if (
        typeof nombre !== "string" ||
        typeof formula !== "string" ||
        typeof tipo !== "string"
    ) {
        return res.status(400).json({
            mensaje: "Todos los campos deben ser texto"
        });
    }

    const formulaActualizada = actualizarFormula(
        id,
        nombre,
        formula,
        tipo
    );

    if (!formulaActualizada) {
        return res.status(404).json({
            mensaje: "Fórmula química no encontrada"
        });
    }

    res.json({
        mensaje: "Fórmula actualizada correctamente",
        formula: formulaActualizada
    });
};

export const borrarFormula = (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const formulaEliminada = eliminarFormula(id);

    if (!formulaEliminada) {
        return res.status(404).json({
            mensaje: "Fórmula química no encontrada"
        });
    }

    res.json({
        mensaje: "Fórmula eliminada correctamente",
        formula: formulaEliminada
    });
};