const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
    const comando = process.argv[2];

    const ruta = path.join(__dirname, '.', 'data', 'autos.json');
    const archivo = await fs.readFile(ruta, 'utf8');
    const autos = JSON.parse(archivo);

    if (comando === 'listar') {
        for (const auto of autos) {
            console.log(`${auto.marca} ${auto.modelo}`);
        }
    } else {
        console.log('Usa: node src/app.js listar');
    }
}

main();