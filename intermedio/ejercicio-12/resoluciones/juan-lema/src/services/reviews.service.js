const reviews = [
  { id: 1, movieId: 1, author: "Lucia", rating: 5, comment: "Muy tensa hasta el final" },
  { id: 2, movieId: 1, author: "Pablo", rating: 3, comment: "Buen inicio, final flojo" },
  { id: 3, movieId: 2, author: "Marta", rating: 4, comment: "Sonido increible" },
];
let nextId = 4;

const listReviewsByMovie = (movieId) => reviews.filter((r) => r.movieId === Number(movieId));
const getReviewById = (movieId, id) => listReviewsByMovie(movieId).find((r) => r.id === Number(id)) || null;

function createReview(movieId, { author, rating, comment }) {
  if (!author || typeof author !== "string" || !author.trim()) throw new Error("author es obligatorio");

  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) throw new Error("rating debe ser un entero entre 1 y 5");

  const review = { id: nextId++, movieId: Number(movieId), author: author.trim(), rating: numericRating, comment: typeof comment === "string" ? comment.trim() : "" };
  reviews.push(review);
  return review;
}

export { listReviewsByMovie, getReviewById, createReview };
