const getTeams = () => {
    const teams = [
        {
            id: 1,
            name: 'Team Alpha',
            game: 'League of Legends'
        }
    ];

    if (!Array.isArray(teams)) {
        throw new Error('Los equipos deben ser un arreglo');
    }

    return teams;
};

module.exports = {
    getTeams
};