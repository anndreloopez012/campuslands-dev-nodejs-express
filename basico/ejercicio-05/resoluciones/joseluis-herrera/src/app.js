import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function equiposJson() {
    const filePath = join(__dirname, '..', 'data', 'equipos.json');

    const file = await readFile(filePath, 'utf8');

    return JSON.parse(file);
}

async function main() {
    try {
        const equipos = await equiposJson();

        console.log(`Equipos encontrados: ${equipos.length}`);

        for (const equipo of equipos) {
            console.log(`${equipo.name}, ${equipo.sport}, ${equipo.city}`);
        }
    } catch (error) {
        console.error(`No se puede leer la informacion: ${error.message}`);
        process.exitCode = 1;
    }
}

main();