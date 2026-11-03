import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

// repositorio que guarda en un archivo JSON de verdad
// - escritura atomica: escribo en un .tmp y luego rename (si se va la luz no queda medio archivo)
// - las escrituras van en fila (una promesa tras otra) para no perder cambios si llegan juntas

export class ErrorDatos extends Error {}

export function crearRepositorioJson(rutaArchivo, { inicial = {} } = {}) {
    let fila = Promise.resolve();

    async function leer() {
        try {
            return JSON.parse(await readFile(rutaArchivo, "utf8"));
        } catch (err) {
            if (err.code === "ENOENT") return structuredClone(inicial);
            if (err instanceof SyntaxError) throw new ErrorDatos(`El archivo de datos esta danado: ${path.basename(rutaArchivo)}`);
            throw err;
        }
    }

    async function escribir(datos) {
        await mkdir(path.dirname(rutaArchivo), { recursive: true });
        const temporal = `${rutaArchivo}.${process.pid}.tmp`;
        await writeFile(temporal, JSON.stringify(datos, null, 2));
        await rename(temporal, rutaArchivo);
    }

    // lee, deja que `cambio` modifique, y guarda. Todo dentro de la fila
    function modificar(cambio) {
        const trabajo = fila.then(async () => {
            const datos = await leer();
            const resultado = await cambio(datos);
            await escribir(datos);
            return resultado;
        });
        // si un trabajo falla, la fila sigue para los demas
        fila = trabajo.catch(() => {});
        return trabajo;
    }

    return { leer, modificar };
}
