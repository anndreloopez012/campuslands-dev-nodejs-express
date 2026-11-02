const spaceships = [
  {
    id: 1,
    name: 'Nostromo',
    type: 'Exploracion',
    status: 'activa'
  },
  {
    id: 2,
    name: 'Millennium Falcon',
    type: 'Transporte',
    status: 'activa'
  },
  {
    id: 3,
    name: 'Enterprise',
    type: 'Exploracion',
    status: 'activa'
  }
];

const getSpaceshipById = (spaceshipId) => {
  if (!Number.isInteger(spaceshipId) || spaceshipId <= 0) {
    const error = new Error('El identificador de la nave no es valido');
    error.statusCode = 400;

    throw error;
  }

  const spaceship = spaceships.find(
    (item) => item.id === spaceshipId
  );

  if (!spaceship) {
    const error = new Error('Nave espacial no encontrada');
    error.statusCode = 404;

    throw error;
  }

  return spaceship;
};

module.exports = {
  getSpaceshipById
};