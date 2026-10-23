// Convierte setTimeout (basado en callbacks) en una promesa que se puede usar con await.
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { delay };
