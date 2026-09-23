
// Simulación de base de datos en memoria para el shooter competitivo
const players = [
  {
    id: 1,
    tag: "ViperQueen",
    rank: "Radiant",
    kda: "2.4",
    mainWeapon: "Vandal"
  },
  {
    id: 2,
    tag: "ShadowSniper",
    rank: "Immortal",
    kda: "1.9",
    mainWeapon: "Operator"
  }
];

export const getAllPlayers = () => {
  return players;
};

export const createPlayer = (newPlayerData) => {
  const newPlayer = {
    id: players.length + 1,
    ...newPlayerData
  };
  players.push(newPlayer);
  return newPlayer;
};