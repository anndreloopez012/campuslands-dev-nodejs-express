import playersService from "../services/player_service.js";

const getPlayers = (req, res) => {
    const players = playersService.getPlayers();

    res.json({
        message: "Jugadores encontrados",
        players: players
    });
};

export default {
    getPlayers
};