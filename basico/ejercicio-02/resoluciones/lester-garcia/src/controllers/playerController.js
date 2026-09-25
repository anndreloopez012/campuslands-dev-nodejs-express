// Importamos funciones específicas usando destructuring
import { getStatsById, calculatePerformance } from '../services/playerService.js';

export const getPlayerStats = (req, res) => {
    const { id } = req.params;
    const stats = getStatsById(id);
    
    if (!stats) {
        return res.status(404).json({ error: "Jugador no encontrado" });
    }
    return res.status(200).json(stats);
};

export const registerMatch = (req, res) => {
    const { username, kills, deaths } = req.body;

    if (!username || kills === undefined || deaths === undefined) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const performance = calculatePerformance(username, kills, deaths);
    return res.status(201).json({ message: "Partida registrada", data: performance });
};
