import {
    obtenerEquipos,
    obtenerEquipoPorId
} from "../services/equipoService.js";

export const listarEquipos = (req, res) => {
    const equipos = obtenerEquipos();

    res.status(200).json(equipos);
};

export const buscarEquipo = (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const equipo = obtenerEquipoPorId(id);

    if (!equipo) {
        return res.status(404).json({
            mensaje: "Equipo no encontrado"
        });
    }

    res.status(200).json(equipo);
};