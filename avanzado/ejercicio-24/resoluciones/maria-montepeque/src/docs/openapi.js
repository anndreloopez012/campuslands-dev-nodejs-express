// documentacion OpenAPI 3.0 escrita a mano
// es la "fuente de verdad": tambien se usa para validar los body que llegan

const error = (ejemplo) => ({
    description: ejemplo,
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { ok: false, message: ejemplo } } }
});

export const openapi = {
    openapi: "3.0.3",
    info: {
        title: "API de formulas quimicas",
        version: "1.0.0",
        description: "Calcula masas molares y guarda compuestos. Avanzado 24 - Maria Montepeque."
    },
    servers: [{ url: "http://localhost:4024", description: "local" }],
    tags: [
        { name: "sistema", description: "estado de la API" },
        { name: "compuestos", description: "compuestos guardados" },
        { name: "calculos", description: "calculos con formulas" }
    ],
    paths: {
        "/health": {
            get: {
                tags: ["sistema"],
                summary: "Estado de la API",
                operationId: "health",
                responses: { 200: { description: "La API funciona", content: { "application/json": { schema: { $ref: "#/components/schemas/Health" } } } } }
            }
        },
        "/api/compuestos": {
            get: {
                tags: ["compuestos"],
                summary: "Listar compuestos",
                operationId: "listarCompuestos",
                parameters: [{ name: "tipo", in: "query", required: false, schema: { type: "string", enum: ["acido", "base", "sal", "oxido", "organico"] }, description: "filtrar por tipo" }],
                responses: {
                    200: {
                        description: "Lista de compuestos",
                        content: { "application/json": { schema: { type: "object", required: ["ok", "data"], properties: { ok: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Compuesto" } } } } } }
                    },
                    400: error("tipo invalido")
                }
            },
            post: {
                tags: ["compuestos"],
                summary: "Guardar un compuesto",
                operationId: "crearCompuesto",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/NuevoCompuesto" }, example: { formula: "NaHCO3", nombre: "Bicarbonato de sodio", tipo: "sal" } } }
                },
                responses: {
                    201: { description: "Creado", content: { "application/json": { schema: { $ref: "#/components/schemas/RespuestaCompuesto" } } } },
                    400: error("Datos invalidos"),
                    409: error("Ya existe ese compuesto")
                }
            }
        },
        "/api/compuestos/{formula}": {
            get: {
                tags: ["compuestos"],
                summary: "Ver un compuesto por su formula",
                operationId: "verCompuesto",
                parameters: [{ name: "formula", in: "path", required: true, schema: { type: "string" }, example: "H2SO4" }],
                responses: {
                    200: { description: "El compuesto", content: { "application/json": { schema: { $ref: "#/components/schemas/RespuestaCompuesto" } } } },
                    404: error("Compuesto no encontrado")
                }
            }
        },
        "/api/masa-molar": {
            post: {
                tags: ["calculos"],
                summary: "Calcular la masa molar de una formula",
                operationId: "masaMolar",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { type: "object", required: ["formula"], additionalProperties: false, properties: { formula: { type: "string", minLength: 1, maxLength: 60 } } }, example: { formula: "Ca(OH)2" } } }
                },
                responses: {
                    200: { description: "Masa molar con el detalle por elemento", content: { "application/json": { schema: { type: "object", required: ["ok", "data"], properties: { ok: { type: "boolean" }, data: { $ref: "#/components/schemas/MasaMolar" } } } } } },
                    400: error("Formula invalida")
                }
            }
        }
    },
    components: {
        schemas: {
            Health: {
                type: "object",
                required: ["ok", "message", "topic"],
                properties: { ok: { type: "boolean" }, message: { type: "string" }, topic: { type: "string" } }
            },
            Error: {
                type: "object",
                required: ["ok", "message"],
                properties: { ok: { type: "boolean", enum: [false] }, message: { type: "string" }, errors: { type: "array", items: { type: "string" } } }
            },
            NuevoCompuesto: {
                type: "object",
                required: ["formula", "nombre", "tipo"],
                additionalProperties: false,
                properties: {
                    formula: { type: "string", minLength: 1, maxLength: 60, example: "NaCl" },
                    nombre: { type: "string", minLength: 2, maxLength: 80, example: "Cloruro de sodio" },
                    tipo: { type: "string", enum: ["acido", "base", "sal", "oxido", "organico"] },
                    peligroso: { type: "boolean", default: false }
                }
            },
            Compuesto: {
                type: "object",
                required: ["formula", "nombre", "tipo", "peligroso", "masaMolar"],
                properties: {
                    formula: { type: "string" },
                    nombre: { type: "string" },
                    tipo: { type: "string", enum: ["acido", "base", "sal", "oxido", "organico"] },
                    peligroso: { type: "boolean" },
                    masaMolar: { type: "number", minimum: 0 }
                }
            },
            RespuestaCompuesto: {
                type: "object",
                required: ["ok", "data"],
                properties: { ok: { type: "boolean" }, data: { $ref: "#/components/schemas/Compuesto" } }
            },
            MasaMolar: {
                type: "object",
                required: ["formula", "atomos", "masaMolar", "unidad", "detalle"],
                properties: {
                    formula: { type: "string" },
                    atomos: { type: "object", additionalProperties: { type: "integer", minimum: 1 } },
                    masaMolar: { type: "number", minimum: 0 },
                    unidad: { type: "string", enum: ["g/mol"] },
                    detalle: {
                        type: "array",
                        items: { type: "object", required: ["simbolo", "cantidad", "aporte"], properties: { simbolo: { type: "string" }, cantidad: { type: "integer", minimum: 1 }, aporte: { type: "number" } } }
                    }
                }
            }
        }
    }
};
