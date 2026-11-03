import {
    obtenerTrabajos,
    obtenerTrabajoPorId,
    crearTrabajo
} from "../services/soldaduraService.js";

export const listarTrabajos = (req, res) => {
    const trabajos = obtenerTrabajos();

    res.json(trabajos);
};

export const buscarTrabajo = (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const trabajo = obtenerTrabajoPorId(id);

    if (!trabajo) {
        return res.status(404).json({
            mensaje: "Trabajo de soldadura no encontrado"
        });
    }

    res.json(trabajo);
};

export const registrarTrabajo = (req, res) => {
    const { cliente, tipo, material } = req.body;

    if (!cliente || !tipo || !material) {
        return res.status(400).json({
            mensaje: "Cliente, tipo y material son obligatorios"
        });
    }

    if (
        typeof cliente !== "string" ||
        typeof tipo !== "string" ||
        typeof material !== "string"
    ) {
        return res.status(400).json({
            mensaje: "Los datos deben ser texto"
        });
    }

    const trabajo = crearTrabajo(cliente, tipo, material);

    res.status(201).json({
        mensaje: "Trabajo registrado correctamente",
        trabajo
    });
};