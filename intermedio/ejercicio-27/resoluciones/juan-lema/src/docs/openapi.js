const errorResponse = (description, example) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example } },
});

const championExample = { id: 1, name: "Kaelthas Furia", role: "medio", winRate: 51.3 };

const openapi = {
  openapi: "3.0.3",
  info: {
    title: "API de campeones MOBA",
    version: "1.0.0",
    description: "Catalogo de campeones de un MOBA de esports. Documentacion generada a mano y verificada por una prueba de contrato: nunca puede desincronizarse de las rutas reales de la app (ver test/openapi-contract.test.js).",
  },
  servers: [{ url: "/" }],
  tags: [{ name: "Sistema" }, { name: "Campeones" }],
  paths: {
    "/health": {
      get: {
        tags: ["Sistema"],
        summary: "Estado del servicio",
        responses: { 200: { description: "El servicio esta activo", content: { "application/json": { example: { ok: true, message: "API de MOBA esports activa" } } } } },
      },
    },
    "/champions": {
      get: {
        tags: ["Campeones"],
        summary: "Listar campeones",
        parameters: [{ name: "role", in: "query", required: false, schema: { $ref: "#/components/schemas/Role" }, description: "Filtra por rol exacto" }],
        responses: {
          200: { description: "Lista de campeones", content: { "application/json": { schema: { type: "object", properties: { ok: { const: true }, data: { type: "array", items: { $ref: "#/components/schemas/Champion" } } } }, example: { ok: true, data: [championExample] } } } },
          400: errorResponse("role no es uno de los valores permitidos", { ok: false, code: "INVALID_QUERY", message: "role debe ser uno de: top, jungla, medio, adc, soporte" }),
        },
      },
      post: {
        tags: ["Campeones"],
        summary: "Crear un campeon",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/NewChampion" }, example: { name: "Vex Umbrio", role: "adc", winRate: 50.4 } } } },
        responses: {
          201: { description: "Campeon creado", headers: { Location: { schema: { type: "string" }, description: "Ruta del nuevo campeon, ej. /champions/4" } }, content: { "application/json": { example: { ok: true, data: championExample } } } },
          400: errorResponse("El cuerpo no cumple las reglas de validacion", { ok: false, code: "INVALID_BODY", message: "name debe tener entre 2 y 40 caracteres" }),
        },
      },
    },
    "/champions/{id}": {
      get: {
        tags: ["Campeones"],
        summary: "Obtener un campeon por id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 }, example: 1 }],
        responses: {
          200: { description: "El campeon pedido", content: { "application/json": { example: { ok: true, data: championExample } } } },
          400: errorResponse("id no es un entero positivo", { ok: false, code: "INVALID_ID", message: "id debe ser un entero positivo" }),
          404: errorResponse("No existe un campeon con ese id", { ok: false, code: "NOT_FOUND", message: "Campeon 99 no encontrado" }),
        },
      },
    },
  },
  components: {
    schemas: {
      Role: { type: "string", enum: ["top", "jungla", "medio", "adc", "soporte"] },
      Champion: {
        type: "object",
        required: ["id", "name", "role", "winRate"],
        properties: {
          id: { type: "integer", minimum: 1, example: 1 },
          name: { type: "string", minLength: 2, maxLength: 40, example: "Kaelthas Furia" },
          role: { $ref: "#/components/schemas/Role" },
          winRate: { type: "number", minimum: 0, maximum: 100, example: 51.3 },
        },
      },
      NewChampion: {
        type: "object",
        required: ["name", "role", "winRate"],
        properties: { name: { type: "string", minLength: 2, maxLength: 40 }, role: { $ref: "#/components/schemas/Role" }, winRate: { type: "number", minimum: 0, maximum: 100 } },
      },
      Error: {
        type: "object",
        required: ["ok", "code", "message"],
        properties: { ok: { const: false }, code: { type: "string", example: "INVALID_BODY" }, message: { type: "string", example: "name debe tener entre 2 y 40 caracteres" } },
      },
    },
  },
};

export { openapi };
