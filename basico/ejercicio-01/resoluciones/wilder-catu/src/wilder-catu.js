const readline = require("readline");

// Jugadores iniciales del equipo
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

// Crear conexión con la terminal
const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Mostrar el menú principal
function mostrarMenu() {
    console.log("\n====================================");
    console.log("     SHOOTER COMPETITIVO - NODE");
    console.log("====================================");
    console.log("1. Mostrar jugadores");
    console.log("2. Buscar jugador");
    console.log("3. Registrar jugador");
    console.log("4. Mostrar estadísticas");
    console.log("5. Salir");
    console.log("====================================");
}

// Mostrar todos los jugadores
function mostrarJugadores() {
    console.log("\n--- JUGADORES REGISTRADOS ---");

    if (jugadores.length === 0) {
        console.log("No hay jugadores registrados.");
        return;
    }

    jugadores.forEach((jugador) => {
        console.log(
            `ID: ${jugador.id} | ` +
            `Jugador: ${jugador.nombre} | ` +
            `Rango: ${jugador.rango} | ` +
            `Victorias: ${jugador.victorias} | ` +
            `Derrotas: ${jugador.derrotas}`
        );
    });
}

// Buscar jugador por ID
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

// Registrar un nuevo jugador
function registrarJugador() {
    console.log("\n--- REGISTRAR JUGADOR ---");

    terminal.question("Nombre del jugador: ", (nombre) => {
        if (nombre.trim() === "") {
            console.log("Error: el nombre no puede estar vacío.");
            mostrarMenu();
            solicitarOpcion();
            return;
        }

        terminal.question("Rango inicial: ", (rango) => {
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
            console.log(`ID asignado: ${nuevoJugador.id}`);
            console.log(`Jugador: ${nuevoJugador.nombre}`);
            console.log(`Rango: ${nuevoJugador.rango}`);

            mostrarMenu();
            solicitarOpcion();
        });
    });
}

// Generar un nuevo ID
function obtenerNuevoId() {
    if (jugadores.length === 0) {
        return 1;
    }

    const ids = jugadores.map((jugador) => jugador.id);

    return Math.max(...ids) + 1;
}

// Calcular estadísticas
function mostrarEstadisticas() {
    console.log("\n--- ESTADÍSTICAS DEL EQUIPO ---");

    if (jugadores.length === 0) {
        console.log("No hay jugadores registrados.");
        mostrarMenu();
        solicitarOpcion();
        return;
    }

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

    mostrarMenu();
    solicitarOpcion();
}

// Procesar la opción elegida
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

// Solicitar una opción desde la terminal
function solicitarOpcion() {
    terminal.question("\nSeleccione una opción: ", (opcion) => {
        procesarOpcion(opcion.trim());
    });
}

// Punto de inicio del programa
console.log("====================================");
console.log("    SISTEMA DE SHOOTER COMPETITIVO");
console.log("====================================");
console.log("Aplicación ejecutada con Node.js.");
console.log("Funcionamiento completamente desde la terminal.");

mostrarMenu();
solicitarOpcion();