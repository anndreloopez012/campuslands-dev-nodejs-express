import { matches } from "../data/matches.js";

export const getAllMatches = () => {
    return matches;
};

export const getMatchById = (id) => {
    return matches.find((match) => match.id === id);
};

export const createMatch = (matchData) => {
    const newMatch = {
        id: matches.length + 1,
        name: matchData.name,
        map: matchData.map,
        players: matchData.players,
        status: "waiting"
    };

    matches.push(newMatch);

    return newMatch;
};