// Básico - Ejercicio 02: npm scripts y package.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function showPackageInfo() {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  const pkgData = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  console.log('=== INFORMACIÓN DEL PROYECTO (package.json) ===');
  console.log(`Proyecto:    ${pkgData.name}`);
  console.log(`Versión:     ${pkgData.version}`);
  console.log(`Descripción: ${pkgData.description}`);
  console.log(`Autor:       ${pkgData.author}`);
  console.log(`Módulo:      ${pkgData.type}`);
  console.log('\nScripts configurados:');
  console.table(pkgData.scripts);
}

export function simulateMatch(playerName) {
  if (!playerName || typeof playerName !== 'string' || playerName.trim() === '') {
    throw new Error('El nombre del jugador es obligatorio para iniciar una partida.');
  }

  const weapons = ['Vandal', 'Phantom', 'Operator', 'Sheriff', 'Spectre'];
  const maps = ['Bind', 'Haven', 'Ascent', 'Split', 'Sunset', 'Lotus'];

  const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];
  const randomMap = maps[Math.floor(Math.random() * maps.length)];
  const kills = Math.floor(Math.random() * 30) + 1;
  const deaths = Math.floor(Math.random() * 15) + 1;
  const kd = (kills / deaths).toFixed(2);

  return {
    jugador: playerName.trim(),
    mapa: randomMap,
    armaFavorita: randomWeapon,
    bajas: kills,
    muertes: deaths,
    kdRatio: Number(kd),
    resultado: kd >= 1.0 ? 'Victoria (MVP)' : 'Derrota'
  };
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--info')) {
    showPackageInfo();
    return;
  }

  console.log('--- SHOOTER COMPETITIVO CLI ---');

  const playerArg = args.find(a => !a.startsWith('--'));
  const playerName = playerArg || 'OlorosoSniper';

  try {
    const stats = simulateMatch(playerName);
    console.log(`\nPartida generada con éxito para el agente: [${stats.jugador}]`);
    console.table([stats]);
  } catch (error) {
    console.error(`\n[ERROR]: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] === __filename) {
  main();
}
