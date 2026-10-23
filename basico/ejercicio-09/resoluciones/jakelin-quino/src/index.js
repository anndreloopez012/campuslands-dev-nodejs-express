const { readFile, writeFile } = require('node:fs/promises');
const path = require('node:path');

const filePath = path.join(__dirname, '..', 'data', 'fighters.json');

async function readFighters() {
  const file = await readFile(filePath, 'utf8');
  return JSON.parse(file);
}

async function saveFighters(fighters) {
  await writeFile(filePath, JSON.stringify(fighters, null, 2));
}

async function main() {
  const [command, name, category] = process.argv.slice(2);
  const fighters = await readFighters();

  if (!command || command === 'list') {
    console.log(JSON.stringify(fighters, null, 2));
    return;
  }

  if (command !== 'add' || !name || !category) {
    throw new Error('Uso: npm start -- list | add <nombre> <categoria>');
  }

  fighters.push({ name, category, wins: 0 });
  await saveFighters(fighters);
  console.log(`Luchador agregado: ${name}`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});