const mockPlayers = {
    "1": { username: "Shroud", rank: "Radiant", kdr: 2.1 },
    "2": { username: "S1mple", rank: "Global Elite", kdr: 1.9 }
};

export const getStatsById = (id) => {
    return mockPlayers[id] || null;
};

export const calculatePerformance = (username, kills, deaths) => {
    const kdr = deaths === 0 ? kills : parseFloat((kills / deaths).toFixed(2));
    return {
        username,
        kills,
        deaths,
        calculatedKdr: kdr,
        status: kdr >= 1.0 ? "Buen rendimiento" : "Necesita practicar"
    };
};
