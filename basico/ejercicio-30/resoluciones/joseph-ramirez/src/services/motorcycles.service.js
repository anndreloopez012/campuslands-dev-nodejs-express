let motorcycles = [
    {
      id: 1,
      marca: "Yamaha",
      modelo: "MT-07",
      anio: 2023,
      cilindrada: 689,
      tipo: "Naked",
      estado: "disponible"
    },
    {
      id: 2,
      marca: "Honda",
      modelo: "CB500F",
      anio: 2022,
      cilindrada: 471,
      tipo: "Naked",
      estado: "en_mantenimiento"
    },
    {
      id: 3,
      marca: "Kawasaki",
      modelo: "Ninja 400",
      anio: 2024,
      cilindrada: 399,
      tipo: "Deportiva",
      estado: "disponible"
    },
    {
      id: 4,
      marca: "Suzuki",
      modelo: "V-Strom 650",
      anio: 2021,
      cilindrada: 645,
      tipo: "Adventure",
      estado: "en_mantenimiento"
    }
  ];
  
  function getAllMotorcycles() {
    return motorcycles;
  }
  
  function getMotorcycleById(id) {
    return motorcycles.find((motorcycle) => motorcycle.id === id);
  }
  
  function createMotorcycle(motorcycleData) {
    const newMotorcycle = {
      id: motorcycles.length > 0
        ? motorcycles[motorcycles.length - 1].id + 1
        : 1,
      ...motorcycleData
    };
  
    motorcycles.push(newMotorcycle);
  
    return newMotorcycle;
  }
  
  function updateMotorcycle(id, motorcycleData) {
    const index = motorcycles.findIndex(
      (motorcycle) => motorcycle.id === id
    );
  
    if (index === -1) {
      return null;
    }
  
    motorcycles[index] = {
      ...motorcycles[index],
      ...motorcycleData
    };
  
    return motorcycles[index];
  }
  
  function deleteMotorcycle(id) {
    const index = motorcycles.findIndex(
      (motorcycle) => motorcycle.id === id
    );
  
    if (index === -1) {
      return null;
    }
  
    const deletedMotorcycle = motorcycles[index];
  
    motorcycles.splice(index, 1);
  
    return deletedMotorcycle;
  }
  
  module.exports = {
    getAllMotorcycles,
    getMotorcycleById,
    createMotorcycle,
    updateMotorcycle,
    deleteMotorcycle
  };