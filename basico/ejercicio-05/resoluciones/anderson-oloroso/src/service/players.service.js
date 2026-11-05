import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '..', '..', 'data','players.json' );

export async function getPlayerById(id){
    const numId = Number(id);
    if(!Number.isInteger(numId) || numId <= 0){
        throw new Error('El id del jugador debe ser un numero entero positivo');
    }

    // Lectura
    const data = await fs.readFile(dataPath, 'utf-8');
    const players = JSON.parse(data);

    const findedPlayer = players.find( plyr => plyr.id === numId);

    if(!findedPlayer){
        throw new Error(`Jugador con id ${numId} no encontrado`);
    }

    return findedPlayer;
}