const { readFile, writeFile } = require('node:fs/promises');
const path = require('node:path');

const ruta = path.join(__dirname, '..', 'data', 'peleadores.json');

async function main() {

    const comando = process.argv[2];
    const nombre = process.argv[3];
    const categoria = process.argv[4];

    const archivo = await readFile(ruta, 'utf8');
    const fighters = JSON.parse(archivo);

    if (comando === 'list') {
        console.log(fighters);
        return;
    }

    if (comando === 'add') {

        fighters.push({
            name: nombre,
            category: categoria,
            wins: 0
        });

        await writeFile(ruta, JSON.stringify(fighters, null, 2));

        console.log(`Luchador agregado: ${nombre}`);
        return;
    }

    console.log('Usa: list o add <nombre> <categoria>');
}

main();