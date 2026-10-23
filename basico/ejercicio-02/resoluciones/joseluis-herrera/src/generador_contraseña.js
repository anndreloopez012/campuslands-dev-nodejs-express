const { default: inquirer } = require("inquirer");
const { Chalk } = require("chalk");

const chalk = new Chalk();

const minusculas = "abcdefghijklmnopqrstuvwxyz";
const mayusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numeros = "0123456789";
const simbolos = "!@#$%^&*";

async function generarPassword() {

    const respuestas = await inquirer.prompt([
        {
            type: "number",
            name: "longitud",
            message: "¿Cuántos caracteres quieres?"
        },
        {
            type: "confirm",
            name: "mayusculas",
            message: "¿Quieres letras mayúsculas?"
        },
        {
            type: "confirm",
            name: "numeros",
            message: "¿Quieres números?"
        },
        {
            type: "confirm",
            name: "simbolos",
            message: "¿Quieres símbolos?"
        }
    ]);

    let caracteres = minusculas;

    if (respuestas.mayusculas) {
        caracteres += mayusculas;
    }
    if (respuestas.numeros) {
        caracteres += numeros;
    }
    if (respuestas.simbolos) {
        caracteres += simbolos;
    }
    let password = "";

    for (let i = 0; i < respuestas.longitud; i++) {

        const posicion = Math.floor(
            Math.random() * caracteres.length
        );

        const caracter = caracteres[posicion];

        password += caracter;
    }

    console.log("\n" + chalk.green(" Tu contraseña es:"));
    console.log(chalk.bold(password));
}

generarPassword();
