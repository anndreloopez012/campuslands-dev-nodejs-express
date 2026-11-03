class MissionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MissionError';
  }
}

function findMission(code) {
  const missions = {
    'ORION-7': 'Explorar el planeta Kepler',
    'NOVA-3': 'Reparar la estacion orbital'
  };

  if (!missions[code]) {
    throw new MissionError(`La mision ${code} no existe.`);
  }

  return missions[code];
}

const code = process.argv[2] || 'ORION-7';

try {
  console.log(`${code}: ${findMission(code)}`);
} catch (error) {
  if (error instanceof MissionError) {
    console.error(`Error de mision: ${error.message}`);
  } else {
    console.error('Error inesperado:', error.message);
  }
  process.exitCode = 1;
}