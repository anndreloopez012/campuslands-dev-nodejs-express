// Básico - Ejercicio 05
import { getPlayerById } from "./service/players.service.js";

async function main() {
    console.log('======== Lectura fs - Futbol ========');
    const args = process.argv.slice(2);
    const playerId = args[0] || 1;

    try{
        const player = await getPlayerById(playerId);
        if(!player){
            console.log(`Jugador con id ${playerId} no encontrado`);
        }
        else{
            console.log(`Jugador con id ${playerId} encontrado`);
            console.table([player]);
        }
    }
    catch(err){
        console.log('[ERROR]: ',err.message);
    }
}

main();
