const teams = [
    {
      id: 1,
      name: "Dragon Core",
      game: "League of Legends",
      region: "LATAM",
      players: 5,
      status: "active"
    },
    {
      id: 2,
      name: "Storm Legends",
      game: "Dota 2",
      region: "North America",
      players: 5,
      status: "active"
    },
    {
      id: 3,
      name: "Titan Squad",
      game: "League of Legends",
      region: "Europe",
      players: 5,
      status: "inactive"
    }
  ];
  
  const getTeams = () => {
    return teams;
  };
  
  module.exports = {
    getTeams
  };