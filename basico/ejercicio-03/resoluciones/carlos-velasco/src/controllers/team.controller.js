const teamService = require("../services/team.service");

const getTeams = (req, res) => {
    const teams = teamService.getAllTeams();

    res.status(200).json({
        ok: true,
        total: teams.length,
        data: teams
    });
};

const getTeam = (req, res) => {
    const id = Number(req.params.id);

    const team = teamService.getTeamById(id);

    if (!team) {
        return res.status(404).json({
            ok: false,
            message: "Equipo no encontrado"
        });
    }

    res.status(200).json({
        ok: true,
        data: team
    });
};

const createNewTeam = (req, res) => {
    const { name, region, game } = req.body;

    if (!name || !region || !game) {
        return res.status(400).json({
            ok: false,
            message: "name, region y game son obligatorios"
        });
    }

    const newTeam = teamService.createTeam({
        name,
        region,
        game
    });

    res.status(201).json({
        ok: true,
        message: "Equipo creado correctamente",
        data: newTeam
    });
};

module.exports = {
    getTeams,
    getTeam,
    createNewTeam
};