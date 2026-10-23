const jugador = process.env.PLAYER_NAME || "Invitado";
const modo = process.env.GAME_MODE || "solo";

console.log("=== Ejercicio 08: variables de entorno ===");
console.log("Jugador:", jugador);
console.log("Modo:", modo);
