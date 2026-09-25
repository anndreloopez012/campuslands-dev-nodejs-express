import {
    getAllMatches,
    getMatchById,
    createMatch
} from "../services/match.service.js";

export const getMatches = (req, res) => {
    const matches = getAllMatches();

    res.status(200).json({
        ok: true,
        total: matches.length,
        data: matches
    });
};

export const getMatch = (req, res) => {
    const id = Number(req.params.id);

    const match = getMatchById(id);

    if (!match) {
        return res.status(404).json({
            ok: false,
            message: "Partida no encontrada"
        });
    }

    res.status(200).json({
        ok: true,
        data: match
    });
};

export const createNewMatch = (req, res) => {
    const { name, map, players } = req.body;

    if (!name || !map || players === undefined) {
        return res.status(400).json({
            ok: false,
            message: "name, map y players son obligatorios"
        });
    }

    if (players <= 0) {
        return res.status(400).json({
            ok: false,
            message: "players debe ser mayor que cero"
        });
    }

    const newMatch = createMatch({
        name,
        map,
        players
    });

    res.status(201).json({
        ok: true,
        message: "Partida creada correctamente",
        data: newMatch
    });
};