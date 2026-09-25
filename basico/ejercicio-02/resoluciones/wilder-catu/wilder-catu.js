const readline = require("readline");

// Jugadores iniciales del shooter
const jugadores = [
{
id: 1,
nombre: "Shadow",
rango: "Diamante",
victorias: 24,
derrotas: 8
},
{
id: 2,
nombre: "Ghost",
rango: "Platino",
victorias: 18,
derrotas: 10
},
{
id: 3,
nombre: "Blaze",
rango: "Oro",
victorias: 15,
derrotas: 12
}
];

// Permite recibir datos desde la terminal
const terminal = readline.createInterface({
input: process.stdin,
output: process.stdout
});

// Muestra el menú principal
function mostrarMenu() {
console.log("\n====================================");
console.log("       SHOOTER COMPETITIVO");
console.log("====================================");
console.log("1. Mostrar jugadores");
console.log("2. Buscar jugador");
console.log("3. Registrar jugador");
console.log("4. Mostrar estadísticas");
console.log("5. Salir");
console.log("====================================");
}

// Muestra todos los jugadores
function mostrarJugadores() {
console.log("\n--- JUGADORES REGISTRADOS ---");


jugadores.forEach((jugador) => {
    console.log(
        `ID: ${jugador.id} | ` +
        `Nombre: ${jugador.nombre} | ` +
        `Rango: ${jugador.rango} | ` +
        `Victorias: ${jugador.victorias} | ` +
        `Derrotas: ${jugador.derrotas}`
    );
});


}

// Busca un jugador utilizando su ID
function buscarJugador() {
terminal.question("\nIngrese el ID del jugador: ", (entrada) => {
const id = Number(entrada);


    if (Number.isNaN(id)) {
        console.log("Error: el ID debe ser un número.");
        mostrarMenu();
        solicitarOpcion();
        return;
    }

    const jugador = jugadores.find(
        (jugador) => jugador.id === id
    );

    if (!jugador) {
        console.log("No se encontró un jugador con ese ID.");
        mostrarMenu();
        solicitarOpcion();
        return;
    }

    console.log("\n--- JUGADOR ENCONTRADO ---");
    console.log(`ID: ${jugador.id}`);
    console.log(`Nombre: ${jugador.nombre}`);
    console.log(`Rango: ${jugador.rango}`);
    console.log(`Victorias: ${jugador.victorias}`);
    console.log(`Derrotas: ${jugador.derrotas}`);

    mostrarMenu();
    solicitarOpcion();
});


}

// Registra un nuevo jugador
function registrarJugador() {
console.log("\n--- REGISTRAR JUGADOR ---");


terminal.question("Nombre: ", (nombre) => {
    if (nombre.trim() === "") {
        console.log("Error: el nombre no puede estar vacío.");
        mostrarMenu();
        solicitarOpcion();
        return;
    }

    terminal.question("Rango: ", (rango) => {
        if (rango.trim() === "") {
            console.log("Error: el rango no puede estar vacío.");
            mostrarMenu();
            solicitarOpcion();
            return;
        }

        const nuevoJugador = {
            id: obtenerNuevoId(),
            nombre: nombre.trim(),
            rango: rango.trim(),
            victorias: 0,
            derrotas: 0
        };

        jugadores.push(nuevoJugador);

        console.log("\nJugador registrado correctamente.");
        console.log(`ID: ${nuevoJugador.id}`);
        console.log(`Nombre: ${nuevoJugador.nombre}`);
        console.log(`Rango: ${nuevoJugador.rango}`);

        mostrarMenu();
        solicitarOpcion();
    });
});

}

// Obtiene un ID nuevo para el jugador
function obtenerNuevoId() {
if (jugadores.length === 0) {
return 1;
}


const ultimoJugador = jugadores[jugadores.length - 1];

return ultimoJugador.id + 1;

}

// Muestra estadísticas generales
function mostrarEstadisticas() {
console.log("\n--- ESTADÍSTICAS ---");

const totalVictorias = jugadores.reduce(
    (total, jugador) => total + jugador.victorias,
    0
);

const totalDerrotas = jugadores.reduce(
    (total, jugador) => total + jugador.derrotas,
    0
);

const totalPartidas = totalVictorias + totalDerrotas;

console.log(`Jugadores registrados: ${jugadores.length}`);
console.log(`Victorias totales: ${totalVictorias}`);
console.log(`Derrotas totales: ${totalDerrotas}`);
console.log(`Partidas jugadas: ${totalPartidas}`);

if (totalPartidas > 0) {
    const porcentajeVictorias =
        (totalVictorias / totalPartidas) * 100;

    console.log(
        `Porcentaje de victorias: ${porcentajeVictorias.toFixed(2)}%`
    );
}

}

// Procesa la opción seleccionada
function procesarOpcion(opcion) {
switch (opcion) {
case "1":
mostrarJugadores();
mostrarMenu();
solicitarOpcion();
break;


    case "2":
        buscarJugador();
        break;

    case "3":
        registrarJugador();
        break;

    case "4":
        mostrarEstadisticas();
        mostrarMenu();
        solicitarOpcion();
        break;

    case "5":
        console.log("\nPrograma finalizado.");
        terminal.close();
        break;

    default:
        console.log("\nOpción no válida.");
        mostrarMenu();
        solicitarOpcion();
}

}

// Solicita una opción al usuario
function solicitarOpcion() {
terminal.question("\nSeleccione una opción: ", (opcion) => {
procesarOpcion(opcion.trim());
});
}

// Inicio del programa
console.log("====================================");
console.log("   SISTEMA DE SHOOTERS COMPETITIVOS");
console.log("====================================");
console.log("Programa ejecutado con Node.js.");
console.log("Funcionamiento exclusivo desde la terminal.");

mostrarMenu();
solicitarOpcion();
