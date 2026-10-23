const { getTeams: getTeamsService } = require('../services/teams.js');

const getTeams = (req, res) => {
    const teams = getTeamsService();

    res.json({
        teams
    });
};

module.exports = {
    getTeams
};