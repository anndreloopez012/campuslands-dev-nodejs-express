const proyectos = [
    {
        id: 1,
        nombre: "Robot futurista",
        tipo: "Cortometraje"
    },
    {
        id: 2,
        nombre: "Ciudad espacial",
        tipo: "Cortometraje"
    }
];

export const obtenerProyectos = (req, res) => {
    res.json(proyectos);
};

export const obtenerProyectoPorId = (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const proyecto = proyectos.find((proyecto) => proyecto.id === id);

    if (!proyecto) {
        return res.status(404).json({
            mensaje: "Proyecto no encontrado"
        });
    }

    res.json(proyecto);
};

export const crearProyecto = (req, res) => {
    const { nombre, tipo } = req.body;

    if (!nombre || !tipo) {
        return res.status(400).json({
            mensaje: "El nombre y el tipo son obligatorios"
        });
    }

    const nuevoProyecto = {
        id: proyectos.length + 1,
        nombre,
        tipo
    };

    proyectos.push(nuevoProyecto);

    res.status(201).json({
        mensaje: "Proyecto creado correctamente",
        proyecto: nuevoProyecto
    });
};