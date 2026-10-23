function fetchMovie(title) {
  return new Promise((resolve, reject) => {
    if (!title || typeof title !== "string" || !title.trim()) {
      reject(new Error("El titulo de la pelicula es obligatorio"));
      return;
    }
    setTimeout(() => {
      resolve({ id: Math.floor(Math.random() * 1000), title: title.trim() });
    }, 200);
  });
}

function fetchRating(movieId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ movieId, rating: (Math.random() * 4 + 6).toFixed(1) });
    }, 200);
  });
}

export { fetchMovie, fetchRating };
