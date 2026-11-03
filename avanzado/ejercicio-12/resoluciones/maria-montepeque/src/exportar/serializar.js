import { Readable } from "node:stream";

// JSON.stringify tiene sorpresas:
//   new Set([1,2])  -> {}            (se pierde todo)
//   new Map(...)    -> {}
//   10n (BigInt)    -> TypeError: Do not know how to serialize a BigInt
//   undefined       -> desaparece la llave
// este replacer los convierte a algo que si sirve en JSON
export function replacerSeguro(_clave, valor) {
    if (typeof valor === "bigint") return valor.toString();
    if (valor instanceof Set) return [...valor];
    if (valor instanceof Map) return Object.fromEntries(valor);
    return valor;
}

export const aJson = (valor, espacios) => JSON.stringify(valor, replacerSeguro, espacios);

// solo deja los campos de la lista blanca (asi los privados nunca salen)
export function proyectar(objeto, campos) {
    const salida = {};
    for (const campo of campos) salida[campo] = objeto[campo];
    return salida;
}

// arma un JSON valido de a pedazos:
//   {"meta":{...},"peliculas":[
//   {...},
//   {...}
//   ],"total":N}
// el total va al final porque recien se sabe despues de recorrer todo
export function streamJson({ meta, nombreLista, items, transformar }) {
    async function* generar() {
        yield `{"meta":${aJson(meta)},"${nombreLista}":[`;
        let total = 0;
        for (const item of items) {
            yield (total === 0 ? "\n" : ",\n") + aJson(transformar(item));
            total++;
            // de vez en cuando le doy paso al event loop para no bloquear otras peticiones
            if (total % 500 === 0) await new Promise((r) => setImmediate(r));
        }
        yield `\n],"total":${total}}\n`;
    }
    return Readable.from(generar());
}
