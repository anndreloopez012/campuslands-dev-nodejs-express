// almacen en memoria con transacciones simuladas
//
// la idea es la misma que en una base de datos:
//   - atomicidad: o se aplican TODOS los cambios o NINGUNO
//   - aislamiento: dos transacciones no se mezclan entre ellas
//
// como lo hago:
//   1. la transaccion trabaja sobre un BORRADOR (una copia de todo)
//   2. si termina bien, el borrador pasa a ser el estado real (commit)
//   3. si tira un error, el borrador se tira a la basura (rollback)
//   4. un candado hace que las transacciones vayan de una en una

export function crearAlmacen(inicial, { conCandado = true } = {}) {
    let estado = structuredClone(inicial);
    let version = 0;
    let candado = Promise.resolve();

    // espera a que termine la transaccion anterior
    function tomarCandado() {
        let soltar;
        const anterior = candado;
        candado = new Promise((resolve) => (soltar = resolve));
        return anterior.then(() => soltar);
    }

    async function transaccion(trabajo) {
        const soltar = conCandado ? await tomarCandado() : () => {};

        try {
            const borrador = structuredClone(estado);
            const resultado = await trabajo(borrador);

            // commit: recien aqui se ven los cambios afuera
            estado = borrador;
            version += 1;
            return resultado;
        } finally {
            // si hubo error no se hizo el commit: el borrador se pierde solo
            soltar();
        }
    }

    // las lecturas devuelven una copia para que nadie cambie el estado sin transaccion
    function leer() {
        return structuredClone(estado);
    }

    return { transaccion, leer, version: () => version };
}
