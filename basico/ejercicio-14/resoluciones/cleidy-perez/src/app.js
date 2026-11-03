const { validateBook, normalizeBook } = require('./services/book.service');
function main() { console.log('=== Ejercicio 14: validacion de entrada ==='); const valid = { title: 'El algoritmo de los sueños', author: 'L. Vega', year: 2023, pages: 280 }; const invalid = { title: '', author: 'L. Vega', year: 3000, pages: 0 }; console.log('Errores del válido:', validateBook(valid)); console.log('Libro normalizado:', normalizeBook(valid)); console.log('Errores del inválido:', validateBook(invalid)); console.log('Ejercicio ejecutado correctamente.'); }
if (require.main === module) { try { main(); } catch (error) { console.error('Error de validación:', error.message); process.exitCode = 1; } }
module.exports = { main };
