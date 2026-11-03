import { readFile } from "node:fs/promises";

// FIXTURE: datos fijos escritos a mano en un .json
// sirve para escenarios exactos que no deben cambiar (ej. "la final del torneo")
// se insertan en orden: primero equipos, luego jugadores, luego partidas
const ORDEN = ["equipos", "jugadores", "partidas"];

export async function cargarFixture(almacen, ruta) {
    const datos = JSON.parse(await readFile(ruta, "utf8"));
    const cargados = {};
    for (const tabla of ORDEN) {
        cargados[tabla] = (datos[tabla] ?? []).map((fila) => almacen.insertar(tabla, fila));
    }
    return cargados;
}
