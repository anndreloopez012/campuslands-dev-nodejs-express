import {
    obtenerPartidas,
    obtenerPartidaPorId
} from "../services/partidaService.js";

export const listarPartidas = (req, res) => {
    const partidas = obtenerPartidas();

    res.status(200).json(partidas);
};

export const buscarPartida = (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const partida = obtenerPartidaPorId(id);

    if (!partida) {
        return res.status(404).json({
            mensaje: "Partida no encontrada"
        });
    }

    res.status(200).json(partida);
};