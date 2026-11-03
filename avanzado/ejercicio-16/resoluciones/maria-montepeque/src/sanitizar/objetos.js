// proteccion contra "prototype pollution"
//
// JSON.parse('{"__proto__":{"admin":true}}') crea un objeto con una llave propia "__proto__"
// si despues se mezcla con un merge ingenuo (destino[clave] = valor), esa asignacion
// cambia el PROTOTIPO de todos los objetos: de repente ({}).admin === true en toda la app

const PELIGROSAS = new Set(["__proto__", "constructor", "prototype"]);

// revisa todo el objeto y devuelve las rutas con llaves peligrosas
export function buscarLlavesPeligrosas(valor, ruta = "body", encontradas = [], profundidad = 0) {
    if (profundidad > 20 || valor === null || typeof valor !== "object") return encontradas;
    for (const clave of Object.keys(valor)) {
        if (PELIGROSAS.has(clave)) encontradas.push(`${ruta}.${clave}`);
        else buscarLlavesPeligrosas(valor[clave], `${ruta}.${clave}`, encontradas, profundidad + 1);
    }
    return encontradas;
}

// merge profundo que ignora las llaves peligrosas
export function mergeSeguro(destino, origen, profundidad = 0) {
    if (profundidad > 10) return destino;
    for (const clave of Object.keys(origen)) {
        if (PELIGROSAS.has(clave)) continue;
        const valor = origen[clave];
        if (valor && typeof valor === "object" && !Array.isArray(valor)) {
            // Object.hasOwn: no sigo propiedades heredadas
            const actual = Object.hasOwn(destino, clave) && typeof destino[clave] === "object" ? destino[clave] : {};
            destino[clave] = mergeSeguro(actual, valor, profundidad + 1);
        } else {
            destino[clave] = valor;
        }
    }
    return destino;
}

// "mass assignment": solo copio los campos permitidos
// si el usuario manda { nombre, rol: "admin", saldo: 9999 } solo paso el nombre
export function elegir(objeto, permitidos) {
    const salida = {};
    for (const campo of permitidos) {
        if (objeto && Object.hasOwn(objeto, campo)) salida[campo] = objeto[campo];
    }
    return salida;
}
