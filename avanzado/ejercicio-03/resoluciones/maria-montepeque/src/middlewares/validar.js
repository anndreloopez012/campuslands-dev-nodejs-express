import AppError from "../shared/app-error.js";

// convierte los issues de zod en una lista facil de leer
// path ["azul", "picks", 2, "campeonId"] -> "azul.picks[2].campeonId"
export function formatearIssues(issues) {
    return issues.map((issue) => {
        const campo = issue.path.reduce((texto, parte) => {
            if (typeof parte === "number") return `${texto}[${parte}]`;
            return texto ? `${texto}.${parte}` : String(parte);
        }, "");

        // para campos de mas digo cuales son
        if (issue.code === "unrecognized_keys") {
            return { campo: campo || "(raiz)", mensaje: `campos no permitidos: ${issue.keys.join(", ")}` };
        }
        return { campo: campo || "(raiz)", mensaje: issue.message };
    });
}

// un solo middleware para validar cualquier parte de la peticion
// uso: validar({ params: idParams, body: campeonCrear })
// lo validado (ya convertido y con defaults) queda en req.datos
export function validar(schemas) {
    return (req, res, next) => {
        req.datos = {};
        const errores = [];

        for (const parte of ["params", "query", "body"]) {
            if (!schemas[parte]) continue;

            // si no mandan body, valido un objeto vacio para que salgan los campos que faltan
            const valor = parte === "body" && req.body === undefined ? {} : req[parte];
            const resultado = schemas[parte].safeParse(valor);

            if (resultado.success) {
                req.datos[parte] = resultado.data;
            } else {
                // digo de donde viene cada error: body, query o params
                formatearIssues(resultado.error.issues).forEach((e) => errores.push({ donde: parte, ...e }));
            }
        }

        if (errores.length > 0) {
            return next(new AppError(400, "Datos invalidos", errores));
        }
        next();
    };
}
