import { exerciseData } from '../data/exercise.data.js';

export function getWelcomeResponse() {
  return {
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    exercise: {
      number: exerciseData.number,
      title: exerciseData.title,
      topic: exerciseData.topic,
      theme: exerciseData.theme,
    },
    developer: exerciseData.developer,
  };
}

export function getHealthResponse() {
  return {
    ok: true,
    status: 'up',
    service: 'basico-16-api',
  };
}