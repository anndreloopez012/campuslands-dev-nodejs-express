import { createHash } from "node:crypto";

// registro de auditoria
//
// - solo se AGREGA: no hay funciones para editar ni borrar
// - cada entrada guarda el hash de la anterior (como una cadena)
//   si alguien cambia una entrada vieja, su hash ya no coincide con el que guardo la siguiente
//   y verificar() dice exactamente donde se rompio
// - los datos sensibles no se guardan (solo que cambiaron)

const SENSIBLES = ["alergias", "condicionMedica", "documento", "firma"];
const GENESIS = "0".repeat(64);

// lo que cambio entre antes y despues: { campo: { antes, despues } }
export function diferencias(antes = {}, despues = {}) {
    const cambios = {};
    const campos = new Set([...Object.keys(antes ?? {}), ...Object.keys(despues ?? {})]);
    for (const campo of campos) {
        const a = antes?.[campo];
        const d = despues?.[campo];
        if (JSON.stringify(a) === JSON.stringify(d)) continue;
        // de un dato sensible solo se anota que cambio, no el valor
        cambios[campo] = SENSIBLES.includes(campo) ? { antes: a === undefined ? undefined : "[OCULTO]", despues: d === undefined ? undefined : "[OCULTO]" } : { antes: a, despues: d };
    }
    return cambios;
}

// JSON con las llaves ordenadas, asi el mismo contenido siempre da el mismo hash
function canonico(valor) {
    if (Array.isArray(valor)) return `[${valor.map(canonico).join(",")}]`;
    if (valor && typeof valor === "object") {
        return `{${Object.keys(valor).sort().filter((k) => valor[k] !== undefined).map((k) => `${JSON.stringify(k)}:${canonico(valor[k])}`).join(",")}}`;
    }
    return JSON.stringify(valor);
}

export const calcularHash = (entrada) => createHash("sha256").update(canonico({ ...entrada, hash: undefined })).digest("hex");

export function crearRegistroAuditoria({ reloj = () => new Date() } = {}) {
    const entradas = [];

    function anotar({ actor, accion, resultado = "exito", recurso = null, antes, despues, motivo, contexto = {} }) {
        const anterior = entradas.at(-1);
        const entrada = {
            n: entradas.length + 1,
            fecha: reloj().toISOString(),
            actor: actor ? { id: actor.id, nombre: actor.nombre, rol: actor.rol } : { id: null, nombre: "anonimo", rol: null },
            accion,
            resultado,
            recurso,
            cambios: antes !== undefined || despues !== undefined ? diferencias(antes, despues) : undefined,
            motivo,
            ip: contexto.ip,
            requestId: contexto.requestId,
            hashAnterior: anterior ? anterior.hash : GENESIS
        };
        entrada.hash = calcularHash(entrada);

        // congelada: nadie la puede cambiar despues
        entradas.push(Object.freeze(entrada));
        return entrada;
    }

    // revisa toda la cadena
    function verificar(lista = entradas) {
        let anterior = GENESIS;
        for (const entrada of lista) {
            if (entrada.hashAnterior !== anterior) {
                return { valido: false, rotaEn: entrada.n, motivo: "la entrada no apunta al hash de la anterior (se borro o se metio una entrada)" };
            }
            if (calcularHash(entrada) !== entrada.hash) {
                return { valido: false, rotaEn: entrada.n, motivo: "el contenido de la entrada fue modificado" };
            }
            anterior = entrada.hash;
        }
        return { valido: true, entradas: lista.length, ultimoHash: anterior };
    }

    function buscar({ accion, recursoTipo, recursoId, actorId, resultado, desde, hasta } = {}) {
        return entradas.filter(
            (e) =>
                (!accion || e.accion === accion || e.accion.startsWith(`${accion}.`)) &&
                (!recursoTipo || e.recurso?.tipo === recursoTipo) &&
                (recursoId === undefined || e.recurso?.id === recursoId) &&
                (actorId === undefined || e.actor.id === actorId) &&
                (!resultado || e.resultado === resultado) &&
                (!desde || e.fecha >= desde) &&
                (!hasta || e.fecha <= hasta)
        );
    }

    // copia para exportar o para simular un ataque en los tests
    const exportar = () => entradas.map((e) => ({ ...e }));

    return { anotar, verificar, buscar, exportar, total: () => entradas.length };
}
