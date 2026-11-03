export const createReviewValidator = (req) => {
  const errors = [];
  const { author, rating, comment, jumpScaresRating } = req.body;

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la reseña no puede estar vacío." }];
  }

  if (!author || typeof author !== "string" || author.trim().length < 2) {
    errors.push({ field: "author", message: "El autor de la reseña debe tener al menos 2 caracteres." });
  }

  const r = Number(rating);
  if (rating === undefined || isNaN(r) || r < 1 || r > 10) {
    errors.push({ field: "rating", message: "La calificación debe ser un número entre 1 y 10." });
  }

  if (!comment || typeof comment !== "string" || comment.trim().length < 10) {
    errors.push({ field: "comment", message: "El comentario debe contener al menos 10 caracteres." });
  }

  if (jumpScaresRating !== undefined) {
    const js = Number(jumpScaresRating);
    if (isNaN(js) || js < 1 || js > 5) {
      errors.push({ field: "jumpScaresRating", message: "La intensidad de jump scares debe estar entre 1 y 5." });
    }
  }

  return errors;
};