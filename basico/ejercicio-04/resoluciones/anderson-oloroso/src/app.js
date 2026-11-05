import shrinkZone, { MAX_RADIUS } from "./services/zone.service.js";

const inputRadius = process.argv[2];
const radius = inputRadius ? Number(inputRadius) : MAX_RADIUS;

console.log("🎮 ══════════════════════════════════════");
console.log("   BATTLE ROYALE - SIMULADOR DE ZONA");
console.log("══════════════════════════════════════════");
console.log(`📏 Radio máximo del mapa: ${MAX_RADIUS}m\n`);

try {
  if (inputRadius && isNaN(radius)) {
    throw new Error("❌ El argumento debe ser un número válido.");
  }

  const result = shrinkZone(radius);

  console.log(`⚡ FASE ${result.phase}`);
  console.log(`   Radio anterior : ${result.previousRadius}m`);
  console.log(`   Nuevo radio    : ${result.newRadius}m`);
  console.log(`   Daño/segundo   : ${result.damagePerSecond} HP`);
  console.log(`   Tiempo de cierre: ${result.timeToClose}s`);

  if (result.isFinalZone) {
    console.log("\n🔥 ¡ZONA FINAL! El círculo se cierra. ¡Lucha o muere!");
  } else {
    console.log("\n🏃 La tormenta se acerca... ¡Muévete al centro!");
  }
} catch (error) {
  console.error(`\n${error.message}`);
  process.exit(1);
}
