import {crearPersonaje, crearPersonajeAleatorio} from "./services/crea_tu_personaje.server.js";  



function runtimeinfo(){
    console.log('|||||NODE RUNTIME INFO (RPG)||||');
    console.log(`Plataforma: ${process.platform}`);
    console.log(`Node Version: ${process.version}`);
    console.log(`PID: ${process.pid}`)
    console.log(`Up Time: ${process.uptime}` )
}


function main(){
    runtimeinfo();

    try{
        
        const heroe = crearPersonaje("Aria", "negro", "Arquero");
        console.log(heroe);
        const heroeAleatorio = crearPersonajeAleatorio("Andres Dictador");
        console.log(heroeAleatorio);


    } catch (error){
    console.error(`Error al crear personaje: ${error.message}`);
    process.exitCode = 1;
    }

}

main()