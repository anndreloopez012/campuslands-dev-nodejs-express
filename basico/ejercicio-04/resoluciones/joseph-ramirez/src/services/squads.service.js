const squads = [
    {
      id: 1,
      name: "Storm Hunters",
      game: "Fortnite",
      region: "LATAM",
      players: 4,
      status: "ready"
    },
    {
      id: 2,
      name: "Night Raiders",
      game: "Apex Legends",
      region: "North America",
      players: 3,
      status: "in_match"
    },
    {
      id: 3,
      name: "Royal Wolves",
      game: "PUBG",
      region: "Europe",
      players: 4,
      status: "eliminated"
    }
  ];
  
  export const getSquadsData = () => {
    return squads;
  };