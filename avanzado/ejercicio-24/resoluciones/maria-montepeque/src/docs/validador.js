// validador chiquito de JSON Schema (solo lo que usa nuestro OpenAPI):
// $ref, type, required, properties, additionalProperties, enum, minimum, minLength, maxLength, items

function resolver(raiz, schema) {
    if (!schema?.$ref) return schema;
    // "#/components/schemas/Compuesto" -> raiz.components.schemas.Compuesto
    const destino = schema.$ref.replace(/^#\//, "").split("/").reduce((obj, parte) => obj?.[parte], raiz);
    if (!destino) throw new Error(`$ref no encontrado: ${schema.$ref}`);
    return destino;
}

function tipoDe(valor) {
    if (valor === null) return "null";
    if (Array.isArray(valor)) return "array";
    if (Number.isInteger(valor)) return "integer";
    return typeof valor;
}

export function validar(raiz, schemaOriginal, valor, ruta = "body") {
    const schema = resolver(raiz, schemaOriginal);
    const errores = [];
    const tipo = tipoDe(valor);

    if (schema.type) {
        const okTipo = schema.type === tipo || (schema.type === "number" && tipo === "integer");
        if (!okTipo) return [`${ruta} debe ser ${schema.type}`];
    }
    if (schema.enum && !schema.enum.includes(valor)) errores.push(`${ruta} debe ser uno de: ${schema.enum.join(", ")}`);
    if (typeof valor === "string") {
        if (schema.minLength !== undefined && valor.length < schema.minLength) errores.push(`${ruta} debe tener al menos ${schema.minLength} caracteres`);
        if (schema.maxLength !== undefined && valor.length > schema.maxLength) errores.push(`${ruta} debe tener maximo ${schema.maxLength} caracteres`);
    }
    if (typeof valor === "number" && schema.minimum !== undefined && valor < schema.minimum) errores.push(`${ruta} debe ser >= ${schema.minimum}`);

    if (tipo === "object") {
        for (const campo of schema.required ?? []) {
            if (!Object.hasOwn(valor, campo)) errores.push(`${ruta}.${campo} es obligatorio`);
        }
        for (const [campo, v] of Object.entries(valor)) {
            if (schema.properties && Object.hasOwn(schema.properties, campo)) {
                errores.push(...validar(raiz, schema.properties[campo], v, `${ruta}.${campo}`));
            } else if (schema.additionalProperties === false) {
                errores.push(`${ruta}.${campo} no esta permitido`);
            } else if (typeof schema.additionalProperties === "object") {
                errores.push(...validar(raiz, schema.additionalProperties, v, `${ruta}.${campo}`));
            }
        }
    }
    if (tipo === "array" && schema.items) valor.forEach((item, i) => errores.push(...validar(raiz, schema.items, item, `${ruta}[${i}]`)));

    return errores;
}

// middleware: valida el body con el requestBody del OpenAPI para esa ruta y metodo
export function validarBody(spec, rutaOpenapi, metodo) {
    const schema = spec.paths[rutaOpenapi]?.[metodo]?.requestBody?.content?.["application/json"]?.schema;
    if (!schema) throw new Error(`No hay requestBody documentado para ${metodo.toUpperCase()} ${rutaOpenapi}`);
    return (req, res, next) => {
        const errores = validar(spec, schema, req.body ?? null);
        if (errores.length > 0) return res.status(400).json({ ok: false, message: "Datos invalidos", errors: errores });
        next();
    };
}
