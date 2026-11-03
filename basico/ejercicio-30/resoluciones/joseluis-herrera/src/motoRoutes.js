import express from "express";

import {
    obtenerMotos,
    obtenerMotoPorId,
    crearMoto,
    actualizarMoto,
    eliminarMoto
} from "./motoService.js";

const router = express.Router();

router.get("/", (req, res) => {
    const motos = obtenerMotos();

    res.status(200).json(motos);
});

router.get("/:id", (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const moto = obtenerMotoPorId(id);

    if (!moto) {
        return res.status(404).json({
            mensaje: "Moto no encontrada"
        });
    }

    res.status(200).json(moto);
});

router.post("/", (req, res) => {
    const {
        marca,
        modelo,
        cilindrada,
        estado
    } = req.body;

    if (
        !marca ||
        !modelo ||
        !cilindrada ||
        !estado
    ) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });
    }

    if (
        typeof marca !== "string" ||
        typeof modelo !== "string" ||
        typeof cilindrada !== "number" ||
        typeof estado !== "string"
    ) {
        return res.status(400).json({
            mensaje: "Los datos tienen un formato incorrecto"
        });
    }

    if (cilindrada <= 0) {
        return res.status(400).json({
            mensaje: "La cilindrada debe ser mayor que 0"
        });
    }

    const moto = crearMoto(
        marca,
        modelo,
        cilindrada,
        estado
    );

    res.status(201).json({
        mensaje: "Moto creada correctamente",
        moto
    });
});

router.put("/:id", (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const {
        marca,
        modelo,
        cilindrada,
        estado
    } = req.body;

    if (
        !marca ||
        !modelo ||
        !cilindrada ||
        !estado
    ) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });
    }

    if (
        typeof marca !== "string" ||
        typeof modelo !== "string" ||
        typeof cilindrada !== "number" ||
        typeof estado !== "string"
    ) {
        return res.status(400).json({
            mensaje: "Los datos tienen un formato incorrecto"
        });
    }

    const moto = actualizarMoto(
        id,
        marca,
        modelo,
        cilindrada,
        estado
    );

    if (!moto) {
        return res.status(404).json({
            mensaje: "Moto no encontrada"
        });
    }

    res.status(200).json({
        mensaje: "Moto actualizada correctamente",
        moto
    });
});

router.delete("/:id", (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const moto = eliminarMoto(id);

    if (!moto) {
        return res.status(404).json({
            mensaje: "Moto no encontrada"
        });
    }

    res.status(200).json({
        mensaje: "Moto eliminada correctamente",
        moto
    });
});

export default router;