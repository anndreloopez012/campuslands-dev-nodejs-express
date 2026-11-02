import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { dirname } from "node:path";

async function createStore({ file, seedFile, logger }) {
    const state = { collections: {}, sequences: {} };
    let pending = null;

    async function load() {
        try {
            await readFile(file);
        } catch {
            await mkdir(dirname(file), { recursive: true });
            await copyFile(seedFile, file);
            logger.info("base de datos creada desde la semilla", { file });
        }
        Object.assign(state, JSON.parse(await readFile(file, "utf-8")));
        logger.debug("datos cargados", Object.fromEntries(Object.entries(state.collections).map(([name, rows]) => [name, rows.length])));
    }

    function persist() {
        pending ??= setTimeout(async () => {
            pending = null;
            await writeFile(file, JSON.stringify(state, null, 2));
            logger.debug("datos guardados en disco", { file });
        }, 50);
    }

    function collection(name) {
        const rows = () => (state.collections[name] ??= []);

        return {
            all: () => rows(),
            find: (predicate) => rows().find(predicate) ?? null,
            byId: (id) => rows().find((row) => row.id === Number(id)) ?? null,
            insert(data) {
                const id = (state.sequences[name] = (state.sequences[name] ?? 0) + 1);
                const row = { id, ...data, createdAt: new Date().toISOString() };
                rows().push(row);
                persist();
                return row;
            },
            update(id, changes) {
                const index = rows().findIndex((row) => row.id === Number(id));
                if (index === -1) return null;
                rows()[index] = { ...rows()[index], ...changes, updatedAt: new Date().toISOString() };
                persist();
                return rows()[index];
            },
            remove(id) {
                const index = rows().findIndex((row) => row.id === Number(id));
                if (index === -1) return false;
                rows().splice(index, 1);
                persist();
                return true;
            },
        };
    }

    await load();
    return { collection };
}

export { createStore };
