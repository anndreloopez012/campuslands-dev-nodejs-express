import { findPlayer, listPlayers } from './services/roster.service.js';
console.log('=== Ejercicio 04: modulos ES Modules ===');
console.table(listPlayers());
console.log('Jugador 2:', findPlayer(2));
console.log('Ejercicio ejecutado correctamente.');
