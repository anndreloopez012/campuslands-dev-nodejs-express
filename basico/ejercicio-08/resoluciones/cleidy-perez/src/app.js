function readEnvironment(env = process.env) {
  const port = Number(env.PORT || 3000); const level = Number(env.PLAYER_LEVEL || 5); const mode = env.GAME_MODE || 'arcade';
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT inválido');
  if (!Number.isInteger(level) || level < 1 || level > 10) throw new Error('PLAYER_LEVEL inválido');
  if (!['arcade', 'simulation', 'tournament'].includes(mode)) throw new Error('GAME_MODE inválido');
  return { port, gameMode: mode, playerLevel: level, playerName: env.PLAYER_NAME || 'Piloto anonimo' };
}
function main() { console.log('=== Ejercicio 08: variables de entorno ==='); console.log(JSON.stringify(readEnvironment(), null, 2)); console.log('Configuración leída correctamente.'); }
if (require.main === module) { try { main(); } catch (error) { console.error('Configuración inválida:', error.message); process.exitCode = 1; } }
module.exports = { readEnvironment, main };
