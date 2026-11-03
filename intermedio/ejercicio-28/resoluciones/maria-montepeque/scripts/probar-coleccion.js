import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { correrArchivoHttp } from "./correr-http.js";

// npm run coleccion                              -> levanta la app sola en un puerto libre
// npm run coleccion -- --url http://localhost:3028 -> usa un servidor que ya esta corriendo
const carpeta = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "http");
const indiceUrl = process.argv.indexOf("--url");

let baseUrl;
let servidor;

if (indiceUrl !== -1) {
    baseUrl = process.argv[indiceUrl + 1];
} else {
    const { default: app } = await import("../src/app.js");
    servidor = app.listen(0);
    await new Promise((resolve) => servidor.once("listening", resolve));
    baseUrl = `http://localhost:${servidor.address().port}`;
}

const archivos = readdirSync(carpeta).filter((f) => f.endsWith(".http")).sort();
let fallos = 0;
let total = 0;

for (const archivo of archivos) {
    console.log(`\n${archivo}`);

    try {
        const resultados = await correrArchivoHttp(path.join(carpeta, archivo), baseUrl);

        for (const r of resultados) {
            total++;
            const marca = r.ok ? "ok  " : "FALLA";
            const espera = r.espera === null ? "" : ` (espera ${r.espera})`;
            console.log(`  ${marca} ${r.status}${espera}  ${r.peticion}`);
            if (!r.ok) {
                fallos++;
                console.log(`        respuesta: ${JSON.stringify(r.body)}`);
            }
        }
    } catch (error) {
        fallos++;
        console.log(`  FALLA ${error.message}`);
    }
}

console.log(`\n${total} peticiones, ${fallos} con problemas`);

if (servidor) servidor.close();
process.exitCode = fallos > 0 ? 1 : 0;
