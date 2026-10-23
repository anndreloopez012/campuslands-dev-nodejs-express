const { Readable } = require('node:stream');

const trainingSessions = [
  {
    id: 1,
    name: 'Fundamentos de guardia',
    duration: 30,
    level: 'basico'
  },
  {
    id: 2,
    name: 'Trabajo de desplazamiento',
    duration: 40,
    level: 'intermedio'
  },
  {
    id: 3,
    name: 'Combinaciones de golpeo',
    duration: 45,
    level: 'intermedio'
  },
  {
    id: 4,
    name: 'Defensa y contraataque',
    duration: 50,
    level: 'avanzado'
  }
];

const createTrainingStream = () => {
  return Readable.from(trainingSessions);
};

module.exports = {
  createTrainingStream
};