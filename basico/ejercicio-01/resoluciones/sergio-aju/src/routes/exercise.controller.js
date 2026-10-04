import { fetchExerciseData } from '../services/exercise.service.js';

export const getExerciseInfo = (req, res) => {
  try {
    const data = fetchExerciseData();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};