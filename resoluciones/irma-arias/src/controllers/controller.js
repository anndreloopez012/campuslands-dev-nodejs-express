
const rpgService = require('../services/rpg.services');

const getEstado = (req, res) => {
    try {
        const resultado = rpgService.obtenerEstadoRPG();
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

module.exports = { getEstado };