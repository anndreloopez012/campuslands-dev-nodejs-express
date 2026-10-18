const inMemoryPlayers = [
  {
    id: "1",
    name: "Ma Long",
    country: "China",
    age: 35,
    gripStyle: "Shakehand",
    hand: "Diestro",
    rankingPoints: 4850,
    matchesWon: 412,
    matchesLost: 48,
    winRatio: 89.5,
    rubberType: "Inverted (Donic/DHS)"
  },
  {
    id: "2",
    name: "Fan Zhendong",
    country: "China",
    age: 27,
    gripStyle: "Shakehand",
    hand: "Diestro",
    rankingPoints: 5200,
    matchesWon: 360,
    matchesLost: 35,
    winRatio: 91.1,
    rubberType: "Inverted (Stiga/DHS)"
  },
  {
    id: "3",
    name: "Felix Lebrun",
    country: "Francia",
    age: 18,
    gripStyle: "Penhold",
    hand: "Diestro",
    rankingPoints: 3950,
    matchesWon: 145,
    matchesLost: 38,
    winRatio: 79.2,
    rubberType: "Inverted (Tibhar)"
  },
  {
    id: "4",
    name: "Tomokazu Harimoto",
    country: "Japón",
    age: 21,
    gripStyle: "Shakehand",
    hand: "Diestro",
    rankingPoints: 4100,
    matchesWon: 230,
    matchesLost: 62,
    winRatio: 78.7,
    rubberType: "Inverted (Butterfly)"
  },
  {
    id: "5",
    name: "Timo Boll",
    country: "Alemania",
    age: 43,
    gripStyle: "Shakehand",
    hand: "Zurdo",
    rankingPoints: 3400,
    matchesWon: 520,
    matchesLost: 125,
    winRatio: 80.6,
    rubberType: "Inverted (Butterfly)"
  },
  {
    id: "6",
    name: "Hugo Calderano",
    country: "Brasil",
    age: 28,
    gripStyle: "Shakehand",
    hand: "Diestro",
    rankingPoints: 4350,
    matchesWon: 280,
    matchesLost: 70,
    winRatio: 80.0,
    rubberType: "Inverted (Cornilleau)"
  },
  {
    id: "7",
    name: "Dang Qiu",
    country: "Alemania",
    age: 27,
    gripStyle: "Penhold",
    hand: "Diestro",
    rankingPoints: 3650,
    matchesWon: 195,
    matchesLost: 55,
    winRatio: 78.0,
    rubberType: "Inverted (Butterfly)"
  }
];

export const findAllPlayers = async () => [...inMemoryPlayers];

export const findPlayerById = async (id) => {
  const p = inMemoryPlayers.find((player) => player.id === String(id));
  return p ? { ...p } : null;
};