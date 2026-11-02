import {
    obtenerProyectos,
    obtenerProyectoPorId,
    crearProyecto
} from "../services/proyectoService.js";

export const listarProyectos = (req, res) => {
    const proyectos = obtenerProyectos();

    res.json(proyectos);
};

export const buscarProyecto = (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const proyecto = obtenerProyectoPorId(id);

    if (!proyecto) {
        return res.status(404).json({
            mensaje: "Proyecto no encontrado"
        });
    }

    res.json(proyecto);
};

export const registrarProyecto = (req, res) => {
    const { nombre, estilo } = req.body;

    if (!nombre || !estilo) {
        return res.status(400).json({
            mensaje: "El nombre y el estilo son obligatorios"
        });
    }

    const proyecto = crearProyecto(nombre, estilo);

    res.status(201).json({
        mensaje: "Proyecto creado correctamente",
        proyecto
    });
};