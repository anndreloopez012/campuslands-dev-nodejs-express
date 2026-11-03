const matches = [
    {
      id: 1,
      game: "Valorant",
      teamA: "Phoenix",
      teamB: "Shadow",
      status: "scheduled"
    },
    {
      id: 2,
      game: "Counter-Strike 2",
      teamA: "Falcons",
      teamB: "Titans",
      status: "in_progress"
    },
    {
      id: 3,
      game: "Apex Legends",
      teamA: "Hunters",
      teamB: "Storm",
      status: "finished"
    }
  ];
  
  const getMatches = () => {
    return matches;
  };
  
  module.exports = {
    getMatches
  };