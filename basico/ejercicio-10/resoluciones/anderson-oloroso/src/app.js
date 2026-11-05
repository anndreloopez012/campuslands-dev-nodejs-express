import { playRally } from "./services/rally.service.js";

const playerName = process.argv[2] || "Jugador 1";

console.log(`\n🏓 Iniciando rally de ping pong para "${playerName}"...`);

playRally(playerName, (error, result) => {
  if (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }

  console.log("\n🏓 ¡Rally finalizado!");
  console.log(`  Jugador:   ${result.player}`);
  console.log(`  Oponente:  ${result.opponent}`);
  console.log(`  Golpes:    ${result.hits}`);
  console.log(`  Duración:  ${result.duration}`);
  console.log(`  🏆 Ganador: ${result.winner}\n`);
});

// Demuestra comportamiento no bloqueante
console.log("⏳ Esperando resultado... (el programa sigue ejecutándose)");
console.log("📋 Esto se imprime ANTES del resultado del rally.");
