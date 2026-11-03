import {
    obtenerJugadores,
    obtenerJugadorPorId,
    crearJugador,
    eliminarJugador
} from "../services/jugadorService.js";

export const listarJugadores = (req, res) => {
    const jugadores = obtenerJugadores();

    res.status(200).json(jugadores);
};

export const buscarJugador = (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const jugador = obtenerJugadorPorId(id);

    if (!jugador) {
        return res.status(404).json({
            mensaje: "Jugador no encontrado"
        });
    }

    res.status(200).json(jugador);
};

export const registrarJugador = (req, res) => {
    const { nombre, juego, rango } = req.body;

    if (!nombre || !juego || !rango) {
        return res.status(400).json({
            mensaje: "Nombre, juego y rango son obligatorios"
        });
    }

    if (
        typeof nombre !== "string" ||
        typeof juego !== "string" ||
        typeof rango !== "string"
    ) {
        return res.status(400).json({
            mensaje: "Todos los campos deben ser texto"
        });
    }

    const jugador = crearJugador(
        nombre,
        juego,
        rango
    );

    res.status(201).json({
        mensaje: "Jugador creado correctamente",
        jugador
    });
};

export const borrarJugador = (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const eliminado = eliminarJugador(id);

    if (!eliminado) {
        return res.status(404).json({
            mensaje: "Jugador no encontrado"
        });
    }

    res.status(204).send();
};