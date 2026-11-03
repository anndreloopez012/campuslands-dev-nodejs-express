import path from "node:path";
import { MODULOS } from "./modules/index.js";
import { crearRepoMemoria } from "./shared/repositorios/memoria.js";
import { crearRepoArchivo } from "./shared/repositorios/archivo-json.js";

// el unico lugar donde se decide QUE implementacion usa cada pieza
// (composition root): los modulos no eligen su repo ni buscan a los otros modulos
export function crearContenedor({ repo = "memoria", dataDir = "./data", modulos = MODULOS } = {}) {
    function crearRepo(modulo) {
        if (repo === "archivo") {
            return crearRepoArchivo(path.join(dataDir, `${modulo.nombre}.json`), modulo.datosIniciales);
        }
        return crearRepoMemoria(modulo.datosIniciales);
    }

    const servicios = {};
    const creados = [];

    for (const modulo of ordenarPorDependencias(modulos)) {
        // solo le paso los services que dijo que necesita
        const suyos = Object.fromEntries(modulo.necesita.map((n) => [n, servicios[n]]));
        const { service, router } = modulo.crear({ repo: crearRepo(modulo), servicios: suyos });

        servicios[modulo.nombre] = service;
        creados.push({ nombre: modulo.nombre, ruta: modulo.ruta, necesita: modulo.necesita, router });
    }

    return { modulos: creados, servicios, repo };
}

// si torneos necesita equipos, equipos se crea primero
// si dos modulos se necesitan entre si (ciclo) aviso con un error claro
function ordenarPorDependencias(modulos) {
    const porNombre = new Map(modulos.map((m) => [m.nombre, m]));
    const ordenados = [];
    const visitando = new Set();
    const listos = new Set();

    function visitar(modulo, camino) {
        if (listos.has(modulo.nombre)) return;
        if (visitando.has(modulo.nombre)) {
            throw new Error(`Dependencia circular entre modulos: ${[...camino, modulo.nombre].join(" -> ")}`);
        }
        visitando.add(modulo.nombre);

        for (const nombre of modulo.necesita) {
            const dependencia = porNombre.get(nombre);
            if (!dependencia) {
                throw new Error(`El modulo ${modulo.nombre} necesita "${nombre}" y no esta registrado`);
            }
            visitar(dependencia, [...camino, modulo.nombre]);
        }

        visitando.delete(modulo.nombre);
        listos.add(modulo.nombre);
        ordenados.push(modulo);
    }

    modulos.forEach((m) => visitar(m, []));
    return ordenados;
}
