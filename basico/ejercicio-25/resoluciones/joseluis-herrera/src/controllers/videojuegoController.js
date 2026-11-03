import {
    obtenerVideojuegos,
    obtenerVideojuegoPorId,
    crearVideojuego
} from "../services/videojuegoService.js";

export const listarVideojuegos = (req, res) => {
    const videojuegos = obtenerVideojuegos();

    res.status(200).json(videojuegos);
};

export const buscarVideojuego = (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const videojuego = obtenerVideojuegoPorId(id);

    if (!videojuego) {
        return res.status(404).json({
            mensaje: "Videojuego no encontrado"
        });
    }

    res.status(200).json(videojuego);
};

export const registrarVideojuego = (req, res) => {
    const { nombre, genero, plataforma } = req.body;

    if (!nombre || !genero || !plataforma) {
        return res.status(400).json({
            mensaje: "Nombre, género y plataforma son obligatorios"
        });
    }

    if (
        typeof nombre !== "string" ||
        typeof genero !== "string" ||
        typeof plataforma !== "string"
    ) {
        return res.status(400).json({
            mensaje: "Todos los campos deben ser texto"
        });
    }

    const videojuego = crearVideojuego(
        nombre,
        genero,
        plataforma
    );

    res.status(201).json({
        mensaje: "Videojuego creado correctamente",
        videojuego
    });
};