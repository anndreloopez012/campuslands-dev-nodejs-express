import { initialPlayers } from "../data/players.data.js";

let players = [...initialPlayers];

export const getAllPlayersService = () => {
  return players;
};

export const getAlivePlayersService = () => {
  return players.filter((player) => player.status === "alive");
};

export const createPlayerService = ({ username }) => {
  const newPlayer = {
    id: String(players.length + 1),
    username,
    health: 100,
    shield: 50,
    kills: 0,
    status: "alive"
  };
  players.push(newPlayer);
  return newPlayer;
};