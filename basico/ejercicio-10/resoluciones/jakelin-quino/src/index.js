const { readFile } = require('node:fs/promises');
const path = require('node:path');

async function loadMatch() {
  const filePath = path.join(__dirname, '..', 'data', 'match.json');
  const file = await readFile(filePath, 'utf8');
  return JSON.parse(file);
}

async function getResult() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return loadMatch();
}

getResult()
  .then((match) => console.log(`${match.playerOne} ${match.scoreOne} - ${match.scoreTwo} ${match.playerTwo}`))
  .catch((error) => {
    console.error(`No se pudo cargar el partido: ${error.message}`);
    process.exitCode = 1;
  });