import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";

// repositorio que guarda en un archivo JSON
// misma interfaz que el de memoria: el resto de la app no sabe cual usa
export function crearRepoArchivo(rutaArchivo, iniciales = []) {
    // todo va en fila (leer y escribir) para que dos peticiones al mismo tiempo no se pisen
    // en Windows ademas no se puede renombrar un archivo mientras otro lo esta leyendo
    let fila = Promise.resolve();

    function enFila(tarea) {
        const resultado = fila.then(tarea);
        fila = resultado.catch(() => {});
        return resultado;
    }

    async function leer() {
        try {
            return JSON.parse(await readFile(rutaArchivo, "utf8"));
        } catch (error) {
            // si el archivo no existe empiezo con los datos iniciales
            if (error.code === "ENOENT") return structuredClone(iniciales);
            throw error;
        }
    }

    async function guardar(items) {
        await mkdir(path.dirname(rutaArchivo), { recursive: true });
        // escribo a un temporal y despues lo renombro, asi nunca queda un archivo a medias
        const temporal = `${rutaArchivo}.tmp`;
        await writeFile(temporal, JSON.stringify(items, null, 2));
        await rename(temporal, rutaArchivo);
    }

    return {
        listar(filtro = () => true) {
            return enFila(async () => (await leer()).filter(filtro));
        },
        buscar(id) {
            return enFila(async () => (await leer()).find((i) => i.id === id) || null);
        },
        crear(datos) {
            return enFila(async () => {
                const items = await leer();
                const nuevo = { id: Math.max(0, ...items.map((i) => i.id)) + 1, ...datos };
                items.push(nuevo);
                await guardar(items);
                return nuevo;
            });
        },
        actualizar(id, cambios) {
            return enFila(async () => {
                const items = await leer();
                const item = items.find((i) => i.id === id);
                if (!item) return null;
                Object.assign(item, cambios);
                await guardar(items);
                return item;
            });
        }
    };
}
