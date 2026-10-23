const teams = require("../data/teams");

const getAllTeams = () => {
    return teams;
};

const getTeamById = (id) => {
    return teams.find((team) => team.id === id);
};

const createTeam = (teamData) => {
    const newTeam = {
        id: teams.length + 1,
        name: teamData.name,
        region: teamData.region,
        game: teamData.game,
        active: true
    };

    teams.push(newTeam);

    return newTeam;
};

module.exports = {
    getAllTeams,
    getTeamById,
    createTeam
};