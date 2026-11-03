export const openApiSpecification = Object.freeze({
  openapi: "3.0.3",
  info: {
    title: "MOBA Esports League API",
    version: "1.0.0",
    description: "Especificación técnica y contrato de endpoints para torneos de MOBA Esports (League of Legends / Dota 2)."
  },
  servers: [
    {
      url: "http://localhost:3000/api/v1",
      description: "Servidor local de desarrollo"
    }
  ],
  paths: {
    "/tournaments/docs": {
      get: {
        summary: "Obtener especificación OpenAPI 3.0 de los endpoints",
        responses: { 200: { description: "Contrato JSON de documentación de la API" } }
      }
    },
    "/tournaments": {
      get: {
        summary: "Listar torneos oficiales de MOBA Esports",
        responses: { 200: { description: "Colección de torneos competitivos" } }
      },
      post: {
        summary: "Registrar un nuevo torneo competitivo",
        requestBody: {
          required: true,
          schema: {
            name: "string (mín. 4 caracteres)",
            gameTitle: "League of Legends | Dota 2 | Honor of Kings",
            region: "LCK | LPL | LEC | LLA | Global",
            prizePoolUsd: "number (>= 1000)"
          }
        },
        responses: {
          201: { description: "Torneo registrado exitosamente" },
          400: { description: "Error de validación de campos" }
        }
      }
    },
    "/tournaments/{id}": {
      get: {
        summary: "Consultar un torneo por su identificador",
        parameters: [{ name: "id", in: "path", required: true, example: "TRN-01" }],
        responses: {
          200: { description: "Detalle del torneo" },
          404: { description: "Torneo no encontrado" }
        }
      }
    }
  }
});
