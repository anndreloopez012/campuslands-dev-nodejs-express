const inMemoryReviews = [
  {
    id: "101",
    movieId: "1",
    author: "GoreLover99",
    rating: 9.5,
    comment: "Una atmósfera asfixiante e implacable. La banda sonora hiela la sangre.",
    jumpScaresRating: 2,
    createdAt: "2026-02-15T18:20:00.000Z"
  },
  {
    id: "102",
    movieId: "1",
    author: "CinematicHorror",
    rating: 8.8,
    comment: "Toni Collette entrega una de las actuaciones más aterradoras del cine moderno.",
    jumpScaresRating: 1,
    createdAt: "2026-03-01T22:15:00.000Z"
  },
  {
    id: "103",
    movieId: "2",
    author: "SpookyNight",
    rating: 8.0,
    comment: "Efectiva y llena de tensión clásica con sustos muy bien construidos.",
    jumpScaresRating: 4,
    createdAt: "2026-01-10T14:00:00.000Z"
  }
];

export const findReviewsByMovieId = async (movieId) => {
  return inMemoryReviews.filter((r) => r.movieId === String(movieId));
};

export const findReviewByIdAndMovieId = async (reviewId, movieId) => {
  const review = inMemoryReviews.find(
    (r) => r.id === String(reviewId) && r.movieId === String(movieId)
  );
  return review ? { ...review } : null;
};

export const saveReview = async (reviewData) => {
  const newReview = { ...reviewData };
  inMemoryReviews.push(newReview);
  return { ...newReview };
};

export const removeReview = async (reviewId, movieId) => {
  const index = inMemoryReviews.findIndex(
    (r) => r.id === String(reviewId) && r.movieId === String(movieId)
  );
  if (index === -1) return false;

  inMemoryReviews.splice(index, 1);
  return true;
};