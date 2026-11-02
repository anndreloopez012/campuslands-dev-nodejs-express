const {
    getAllPlayers,
    getPlayerById
} = require('../services/playerServices');

const getPlayers = (req, res) =>{
    const players = getAllPlayers();

    res.status(200).json(players);

};

const getPlayer = (req, res) =>{
    const id = Number(req.params.id);
    
    if (Number.isNaN(id)){
        return res.status(400),json({
            message: "El id debe ser un numero"
        });
    }
    
    const player = getPlayerById(id);

    if(!player){
        return res.status(404).json({
            message : "Jugador no encontrado"

        });
    }
    res.status(200).json(player);

};

module.exports = {
    getPlayers,
    getPlayer
};
