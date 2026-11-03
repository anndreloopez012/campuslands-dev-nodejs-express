// checklist antes de desplegar: npm run verificar
// revisa archivos del proyecto y la config de produccion. Si algo falla sale con codigo 1
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { leerConfig } from "../src/config.js";

export function verificarDespliegue(carpeta, env = process.env) {
    const leer = (archivo) => (existsSync(path.join(carpeta, archivo)) ? readFileSync(path.join(carpeta, archivo), "utf8") : null);
    const paquete = JSON.parse(leer("package.json") ?? "{}");
    const dockerfile = leer("Dockerfile") ?? "";
    const dockerignore = (leer(".dockerignore") ?? "").split(/\r?\n/).map((l) => l.trim());
    const gitignoreRaiz = leer(".gitignore") ?? "";

    const chequeos = [];
    const revisar = (nombre, ok, detalle = "") => chequeos.push({ nombre, ok: Boolean(ok), detalle });

    revisar("package.json tiene engines.node", paquete.engines?.node, paquete.engines?.node);
    revisar("npm start no usa --watch ni nodemon", paquete.scripts?.start && !/--watch|nodemon/.test(paquete.scripts.start), paquete.scripts?.start);
    revisar("supertest y herramientas de test estan en devDependencies", !paquete.dependencies?.supertest);
    revisar("existe Dockerfile", dockerfile.length > 0);
    revisar("Dockerfile instala sin dependencias de desarrollo", /--omit=dev|npm ci --only=production/.test(dockerfile));
    revisar("Dockerfile no corre como root", /^USER\s+(?!root)\S+/m.test(dockerfile));
    revisar("Dockerfile tiene HEALTHCHECK", /^HEALTHCHECK/m.test(dockerfile));
    revisar("Dockerfile arranca con node (recibe SIGTERM)", /^CMD \["node"/m.test(dockerfile));
    revisar(".dockerignore excluye node_modules y .env", dockerignore.includes("node_modules") && dockerignore.includes(".env"));
    revisar("no hay .env dentro del proyecto para subir", !existsSync(path.join(carpeta, ".env")) || /^\.env$/m.test(gitignoreRaiz), "si hay .env debe estar en .gitignore");

    // la config de produccion tiene que pasar la validacion
    try {
        const config = leerConfig({ ...env, NODE_ENV: "production" });
        revisar("config de production valida", true, `commit ${config.gitSha}`);
    } catch (err) {
        revisar("config de production valida", false, err.message);
    }

    return { ok: chequeos.every((c) => c.ok), chequeos };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    const carpeta = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const { ok, chequeos } = verificarDespliegue(carpeta);
    for (const c of chequeos) console.log(`${c.ok ? "OK  " : "FALLA"} ${c.nombre}${c.detalle ? ` (${c.detalle})` : ""}`);
    console.log(ok ? "\nListo para desplegar" : "\nNO desplegar todavia");
    process.exit(ok ? 0 : 1);
}
