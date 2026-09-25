const tattoos = [
    {
      id: 1,
      nombre: "Dragon Japones",
      artista: "Carlos Mendoza",
      estilo: "Tradicional",
      zona: "Brazo",
      precio: 450
    },
    {
      id: 2,
      nombre: "Rosa Negra",
      artista: "Laura Garcia",
      estilo: "Realismo",
      zona: "Hombro",
      precio: 300
    },
    {
      id: 3,
      nombre: "Leon Geometrico",
      artista: "Miguel Torres",
      estilo: "Geometrico",
      zona: "Espalda",
      precio: 600
    },
    {
      id: 4,
      nombre: "Calavera Mexicana",
      artista: "Ana Lopez",
      estilo: "Tradicional",
      zona: "Pierna",
      precio: 500
    },
    {
      id: 5,
      nombre: "Serpiente Minimalista",
      artista: "Carlos Mendoza",
      estilo: "Minimalista",
      zona: "Antebrazo",
      precio: 250
    }
  ];
  
  function getAllTattoos() {
    return tattoos;
  }
  
  function getTattooById(id) {
    return tattoos.find((tattoo) => tattoo.id === id);
  }
  
  function searchTattoos(filters) {
    let results = tattoos;
  
    if (filters.estilo) {
      results = results.filter(
        (tattoo) =>
          tattoo.estilo.toLowerCase() === filters.estilo.toLowerCase()
      );
    }
  
    if (filters.artista) {
      results = results.filter(
        (tattoo) =>
          tattoo.artista.toLowerCase() === filters.artista.toLowerCase()
      );
    }
  
    if (filters.zona) {
      results = results.filter(
        (tattoo) =>
          tattoo.zona.toLowerCase() === filters.zona.toLowerCase()
      );
    }
  
    return results;
  }
  
  module.exports = {
    getAllTattoos,
    getTattooById,
    searchTattoos
  };