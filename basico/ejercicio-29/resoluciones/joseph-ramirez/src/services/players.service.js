const players = [
    {
      id: 1,
      nombre: "Carlos Martinez",
      equipo: "Guatemala FC",
      modalidad: "Futbol",
      posicion: "Delantero",
      goles: 12
    },
    {
      id: 2,
      nombre: "Luis Gonzalez",
      equipo: "Futsal United",
      modalidad: "Futbol Sala",
      posicion: "Ala",
      goles: 8
    },
    {
      id: 3,
      nombre: "Miguel Herrera",
      equipo: "Real Capital",
      modalidad: "Futbol",
      posicion: "Defensa",
      goles: 3
    },
    {
      id: 4,
      nombre: "Diego Lopez",
      equipo: "Sala Stars",
      modalidad: "Futbol Sala",
      posicion: "Pivot",
      goles: 15
    }
  ];
  
  function getAllPlayers() {
    return players;
  }
  
  function getPlayerById(id) {
    return players.find((player) => player.id === id);
  }
  
  module.exports = {
    getAllPlayers,
    getPlayerById
  };