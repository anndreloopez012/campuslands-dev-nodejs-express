async function getMovie(id) { await new Promise((resolve) => setTimeout(resolve, 25)); return { id, title: 'La estación silenciosa', year: 2024 }; }
async function getCategories(id) { await new Promise((resolve) => setTimeout(resolve, 15)); return { id, categories: ['suspenso', 'ciencia ficcion'] }; }
async function getMovieDetails(id) { const [movie, categories] = await Promise.all([getMovie(id), getCategories(id)]); return { ...movie, ...categories }; }
module.exports = { getMovie, getCategories, getMovieDetails };
