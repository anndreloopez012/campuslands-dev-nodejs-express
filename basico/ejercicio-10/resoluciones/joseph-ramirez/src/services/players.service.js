const players = [
    {
      id: 1,
      nombre: "Carlos Mendoza",
      edad: 24,
      ranking: 8,
      pais: "Guatemala"
    },
    {
      id: 2,
      nombre: "Daniel Lopez",
      edad: 27,
      ranking: 15,
      pais: "Mexico"
    },
    {
      id: 3,
      nombre: "Andres Castillo",
      edad: 22,
      ranking: 21,
      pais: "Costa Rica"
    },
    {
      id: 4,
      nombre: "Miguel Torres",
      edad: 29,
      ranking: 5,
      pais: "El Salvador"
    }
  ];
  
  function simulateAsyncOperation(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
      }, 500);
    });
  }
  
  async function getAllPlayers() {
    const result = await simulateAsyncOperation(players);
  
    return result;
  }
  
  async function getPlayerById(id) {
    const result = await simulateAsyncOperation(players);
  
    return result.find((player) => player.id === id);
  }
  
  async function getPlayersByCountry(country) {
    const result = await simulateAsyncOperation(players);
  
    return result.filter(
      (player) =>
        player.pais.toLowerCase() === country.toLowerCase()
    );
  }
  
  module.exports = {
    getAllPlayers,
    getPlayerById,
    getPlayersByCountry
  };