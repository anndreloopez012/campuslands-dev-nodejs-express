const { readFile } = require('node:fs/promises');
const path = require('node:path');

async function main() {
    const ruta = path.join(__dirname, '..', 'data', 'pinpong.json');

    const archivo = await readFile(ruta, 'utf8');
    const partido = JSON.parse(archivo);

    console.log(
        `${partido.playerOne} ${partido.scoreOne} - ${partido.scoreTwo} ${partido.playerTwo}`
    );
}

main();