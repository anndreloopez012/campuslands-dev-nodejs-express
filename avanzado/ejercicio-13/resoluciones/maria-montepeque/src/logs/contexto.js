import { AsyncLocalStorage } from "node:async_hooks";

// AsyncLocalStorage guarda datos que "siguen" a la peticion por todos los await
// asi un service puede loguear con el requestId sin que le pase el req como parametro
const almacen = new AsyncLocalStorage();

export function correrConContexto(contexto, fn) {
    return almacen.run(contexto, fn);
}

// el logger de la peticion actual (o el general si no hay peticion)
export function log(porDefecto) {
    return almacen.getStore()?.logger ?? porDefecto;
}

export function contextoActual() {
    return almacen.getStore();
}
