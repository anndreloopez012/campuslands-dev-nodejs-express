import * as horrorService from '../services/horror.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'subrecursos REST' });

export const getMovieReviews = (req, res) => {
  try {
    const reviews = horrorService.getReviews(req.params.id);
    return res.status(200).json({ ok: true, movieId: Number(req.params.id), total: reviews.length, data: reviews });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};

export const postMovieReview = (req, res) => {
  try {
    const { autor, calificacion, comentario } = req.body;
    if (calificacion === undefined || isNaN(Number(calificacion))) {
      return res.status(400).json({ ok: false, message: 'La calificación numérica (1-10) es requerida.' });
    }
    const review = horrorService.addReview(req.params.id, { autor, calificacion, comentario });
    return res.status(201).json({ ok: true, message: 'Crítica agregada al subrecurso exitosamente', data: review });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};
