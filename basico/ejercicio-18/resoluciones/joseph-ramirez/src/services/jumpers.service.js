let jumpers = [
    {
      id: 1,
      nombre: "Carlos Martinez",
      edad: 28,
      experiencia: "Intermedio",
      saltos: 35,
      apto: true
    },
    {
      id: 2,
      nombre: "Laura Gonzalez",
      edad: 31,
      experiencia: "Avanzado",
      saltos: 120,
      apto: true
    },
    {
      id: 3,
      nombre: "Miguel Herrera",
      edad: 24,
      experiencia: "Principiante",
      saltos: 5,
      apto: true
    }
  ];
  
  function getAllJumpers() {
    return jumpers;
  }
  
  function createJumper(jumperData) {
    const newJumper = {
      id: jumpers.length > 0 ? jumpers[jumpers.length - 1].id + 1 : 1,
      ...jumperData
    };
  
    jumpers.push(newJumper);
  
    return newJumper;
  }
  
  module.exports = {
    getAllJumpers,
    createJumper
  };