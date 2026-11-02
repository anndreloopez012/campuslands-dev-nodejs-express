import { getMatches } from "../services/match.service.js";

export const getAllMatches = async (req, res) => {
    try {
        const matches = await getMatches();

        res.status(200).json({
            ok: true,
            total: matches.length,
            data: matches
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "No se pudieron leer los partidos"
        });
    }
};