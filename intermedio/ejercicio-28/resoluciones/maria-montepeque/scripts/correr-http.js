import { leerArchivoHttp, leerJsonPath } from "./leer-http.js";

// manda en orden las peticiones de un .http y compara el status con "# espera:"
// baseUrl reemplaza al @baseUrl del archivo, asi puedo apuntar a otro puerto
async function correrArchivoHttp(ruta, baseUrl) {
    const pasos = leerArchivoHttp(ruta);
    const variables = {};
    const respuestas = {};
    const resultados = [];

    // cambia {{algo}} por su valor, puede ser una variable o una respuesta anterior
    function resolver(texto) {
        return texto.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (todo, clave) => {
            if (clave === "baseUrl" && baseUrl) return baseUrl;
            if (Object.hasOwn(variables, clave)) return resolver(variables[clave]);

            const deRespuesta = clave.match(/^(\w+)\.response\.(body|headers)\.(.+)$/);
            if (deRespuesta) {
                const [, nombre, donde, camino] = deRespuesta;
                const respuesta = respuestas[nombre];
                if (!respuesta) throw new Error(`Se usa ${nombre} pero esa peticion no se mando antes`);

                const valor = donde === "body"
                    ? leerJsonPath(respuesta.body, camino)
                    : respuesta.headers.get(camino);
                if (valor === undefined || valor === null) throw new Error(`${clave} no existe en la respuesta`);
                return String(valor);
            }

            throw new Error(`La variable {{${clave}}} no esta definida`);
        });
    }

    for (const paso of pasos) {
        for (const [nombre, valor] of paso.variables) {
            variables[nombre] = valor;
        }
        if (!paso.metodo) continue;

        const url = resolver(paso.url);
        const headers = {};
        for (const [clave, valor] of Object.entries(paso.headers)) {
            headers[clave] = resolver(valor);
        }
        const body = paso.body ? resolver(paso.body) : undefined;

        const respuesta = await fetch(url, { method: paso.metodo, headers, body });
        const texto = await respuesta.text();

        let json = null;
        try {
            json = JSON.parse(texto);
        } catch {
            // no todas las respuestas son json
        }

        if (paso.nombre) {
            respuestas[paso.nombre] = { body: json, headers: respuesta.headers };
        }

        resultados.push({
            titulo: paso.titulo || paso.nombre || "",
            peticion: `${paso.metodo} ${url.replace(baseUrl || "", "")}`,
            status: respuesta.status,
            espera: paso.espera,
            ok: paso.espera === null || paso.espera === respuesta.status,
            body: json
        });
    }

    return resultados;
}

export { correrArchivoHttp };
