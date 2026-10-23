const readline = require("readline");

// Datos iniciales de personajes RPG
const personajes = [
    {
        id: 1,
        nombre: "Arthas",
        clase: "Guerrero",
        nivel: 10,
        vida: 150
    },
    {
        id: 2,
        nombre: "Luna",
        clase: "Maga",
        nivel: 8,
        vida: 100
    },
    {
        id: 3,
        nombre: "Ragnar",
        clase: "Arquero",
        nivel: 7,
        vida: 90
    }
];

// Crear la interfaz para recibir información desde la terminal
const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Mostrar el menú principal
function mostrarMenu() {
    console.log("\n=================================");
    console.log("       SISTEMA RPG - NODE.JS");
    console.log("=================================");
    console.log("1. Mostrar personajes");
    console.log("2. Buscar personaje");
    console.log("3. Crear personaje");
    console.log("4. Mostrar estadísticas");
    console.log("5. Salir");
    console.log("=================================");
}

// Mostrar todos los personajes
function mostrarPersonajes() {
    console.log("\n--- PERSONAJES RPG ---");

    if (personajes.length === 0) {
        console.log("No existen personajes registrados.");
        return;
    }

    personajes.forEach((personaje) => {
        console.log(
            `ID: ${personaje.id} | ` +
            `Nombre: ${personaje.nombre} | ` +
            `Clase: ${personaje.clase} | ` +
            `Nivel: ${personaje.nivel} | ` +
            `Vida: ${personaje.vida}`
        );
    });
}

// Buscar un personaje por ID
function buscarPersonaje() {
    terminal.question("\nIngrese el ID del personaje: ", (entrada) => {
        const id = Number(entrada);

        if (Number.isNaN(id)) {
            console.log("Error: el ID debe ser un número.");
            mostrarMenu();
            solicitarOpcion();
            return;
        }

        const personaje = personajes.find(
            (personaje) => personaje.id === id
        );

        if (!personaje) {
            console.log("No se encontró ningún personaje con ese ID.");
            mostrarMenu();
            solicitarOpcion();
            return;
        }

        console.log("\n--- PERSONAJE ENCONTRADO ---");
        console.log(`ID: ${personaje.id}`);
        console.log(`Nombre: ${personaje.nombre}`);
        console.log(`Clase: ${personaje.clase}`);
        console.log(`Nivel: ${personaje.nivel}`);
        console.log(`Vida: ${personaje.vida}`);

        mostrarMenu();
        solicitarOpcion();
    });
}

// Crear un nuevo personaje
function crearPersonaje() {
    console.log("\n--- CREAR PERSONAJE ---");

    terminal.question("Nombre: ", (nombre) => {
        if (nombre.trim() === "") {
            console.log("Error: el nombre no puede estar vacío.");
            mostrarMenu();
            solicitarOpcion();
            return;
        }

        terminal.question("Clase: ", (clase) => {
            if (clase.trim() === "") {
                console.log("Error: la clase no puede estar vacía.");
                mostrarMenu();
                solicitarOpcion();
                return;
            }

            terminal.question("Nivel: ", (nivelEntrada) => {
                const nivel = Number(nivelEntrada);

                if (Number.isNaN(nivel) || nivel <= 0) {
                    console.log(
                        "Error: el nivel debe ser un número mayor que cero."
                    );
                    mostrarMenu();
                    solicitarOpcion();
                    return;
                }

                terminal.question("Vida: ", (vidaEntrada) => {
                    const vida = Number(vidaEntrada);

                    if (Number.isNaN(vida) || vida <= 0) {
                        console.log(
                            "Error: la vida debe ser un número mayor que cero."
                        );
                        mostrarMenu();
                        solicitarOpcion();
                        return;
                    }

                    const nuevoPersonaje = {
                        id: obtenerNuevoId(),
                        nombre: nombre.trim(),
                        clase: clase.trim(),
                        nivel: nivel,
                        vida: vida
                    };

                    personajes.push(nuevoPersonaje);

                    console.log("\nPersonaje creado correctamente.");
                    console.log(`ID asignado: ${nuevoPersonaje.id}`);
                    console.log(`Nombre: ${nuevoPersonaje.nombre}`);

                    mostrarMenu();
                    solicitarOpcion();
                });
            });
        });
    });
}

// Obtener un ID nuevo
function obtenerNuevoId() {
    if (personajes.length === 0) {
        return 1;
    }

    const ids = personajes.map((personaje) => personaje.id);

    return Math.max(...ids) + 1;
}

// Mostrar estadísticas generales
function mostrarEstadisticas() {
    console.log("\n--- ESTADÍSTICAS DEL RPG ---");

    if (personajes.length === 0) {
        console.log("No existen personajes registrados.");
        mostrarMenu();
        solicitarOpcion();
        return;
    }

    const nivelTotal = personajes.reduce(
        (total, personaje) => total + personaje.nivel,
        0
    );

    const vidaTotal = personajes.reduce(
        (total, personaje) => total + personaje.vida,
        0
    );

    const nivelPromedio = nivelTotal / personajes.length;
    const vidaPromedio = vidaTotal / personajes.length;

    console.log(`Cantidad de personajes: ${personajes.length}`);
    console.log(`Nivel promedio: ${nivelPromedio.toFixed(2)}`);
    console.log(`Vida promedio: ${vidaPromedio.toFixed(2)}`);

    mostrarMenu();
    solicitarOpcion();
}

// Procesar la opción seleccionada
function procesarOpcion(opcion) {
    switch (opcion) {
        case "1":
            mostrarPersonajes();
            mostrarMenu();
            solicitarOpcion();
            break;

        case "2":
            buscarPersonaje();
            break;

        case "3":
            crearPersonaje();
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

// Solicitar una opción al usuario
function solicitarOpcion() {
    terminal.question("\nSeleccione una opción: ", (opcion) => {
        procesarOpcion(opcion.trim());
    });
}

// Inicio del programa
console.log("=================================");
console.log("     BIENVENIDO AL SISTEMA RPG");
console.log("=================================");
console.log("Aplicación ejecutada con Node.js");
console.log("Funcionamiento completamente desde la terminal.");

mostrarMenu();
solicitarOpcion();