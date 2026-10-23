const players = [
    {
        id: 1,
        nickname:"sharom",
        team: "Dragons",
        role: "jungler"

    },
    {
        id: 2,
        nickname:"Fenix",
        team: "Titans",
        role: "Mid"

    },
    {
        id: 3,
        nickname:"Blaze",
        team: "Dragons",
        role: "Top"

    },
    {
        id: 4,
        nickname:"Ghost",
        team: "Titans",
        role: "Support"

    },
    {
        id: 1,
        nickname:"Storm",
        team: "Dragons",
        role: "ADC"

    }
];

const getAllPlayers = ()=>{
    return players;
};

const getPlayerById =(id)=>{
    return players.find(player => player.id === id);
};

module.exports = {
    getAllPlayers,
    getPlayerById

};

