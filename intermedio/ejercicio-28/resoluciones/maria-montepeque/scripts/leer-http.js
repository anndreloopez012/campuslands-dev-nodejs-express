import { readFileSync } from "node:fs";

// lee un archivo .http (formato de REST Client) y lo convierte en una lista de peticiones
// soporta lo que usa esta coleccion:
//   @variable = valor
//   # @name nombre        (para usar la respuesta despues)
//   # espera: 201         (status esperado, lo uso yo para revisar)
//   METODO url, headers, linea en blanco y body
function leerArchivoHttp(ruta) {
    const texto = readFileSync(ruta, "utf8").replace(/\r\n/g, "\n");

    // cada bloque empieza con ###
    const bloques = texto.split(/^###.*$/m);
    const pasos = [];

    for (const bloque of bloques) {
        const lineas = bloque.split("\n");
        const peticion = { variables: [], nombre: null, espera: null, titulo: null, metodo: null, url: null, headers: {}, body: "" };
        let parte = "antes"; // antes -> headers -> body

        for (const linea of lineas) {
            const limpia = linea.trim();

            if (parte === "antes") {
                if (limpia === "") continue;

                const variable = limpia.match(/^@(\w+)\s*=\s*(.*)$/);
                if (variable) {
                    peticion.variables.push([variable[1], variable[2]]);
                    continue;
                }

                if (limpia.startsWith("#") || limpia.startsWith("//")) {
                    const nombre = limpia.match(/^#\s*@name\s+(\w+)/);
                    const espera = limpia.match(/^#\s*espera:\s*(\d{3})/);
                    if (nombre) peticion.nombre = nombre[1];
                    else if (espera) peticion.espera = Number(espera[1]);
                    else if (!peticion.titulo) peticion.titulo = limpia.replace(/^(#|\/\/)\s*/, "");
                    continue;
                }

                const [metodo, ...resto] = limpia.split(/\s+/);
                peticion.metodo = metodo.toUpperCase();
                peticion.url = resto.join(" ");
                parte = "headers";
                continue;
            }

            if (parte === "headers") {
                if (limpia === "") {
                    parte = "body";
                    continue;
                }
                const separador = limpia.indexOf(":");
                peticion.headers[limpia.slice(0, separador).trim()] = limpia.slice(separador + 1).trim();
                continue;
            }

            peticion.body += linea + "\n";
        }

        peticion.body = peticion.body.trim();
        if (peticion.metodo || peticion.variables.length > 0) {
            pasos.push(peticion);
        }
    }

    return pasos;
}

// busca "$.data.token" o "$.data.jugadores[0].gamertag" dentro de un objeto
function leerJsonPath(objeto, camino) {
    const partes = camino.replace(/^\$\.?/, "").match(/[^.[\]]+/g) || [];
    return partes.reduce((actual, parte) => (actual == null ? undefined : actual[parte]), objeto);
}

export { leerArchivoHttp, leerJsonPath };
