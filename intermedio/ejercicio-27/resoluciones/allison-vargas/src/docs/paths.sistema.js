import { respuesta } from './ayudas.js';

export const rutasSistema = {
  '/': {
    get: {
      tags: ['Sistema'],
      operationId: 'principal',
      summary: 'Ruta principal del ejercicio',
      description: 'Confirma que la API esta arriba.',
      responses: {
        200: respuesta(
          'La API responde.',
          {
            type: 'object',
            additionalProperties: false,
            required: ['ok', 'message', 'topic'],
            properties: {
              ok: { type: 'boolean' },
              message: { type: 'string' },
              topic: { type: 'string' },
            },
          },
          { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'documentacion de endpoints' },
        ),
      },
    },
  },
  '/docs': {
    get: {
      tags: ['Sistema'],
      operationId: 'verDocumentacion',
      summary: 'Documentacion en HTML',
      description: 'Pagina con todos los endpoints, generada a partir de la misma especificacion OpenAPI.',
      responses: {
        200: {
          description: 'Pagina HTML autocontenida.',
          content: { 'text/html': { schema: { type: 'string' } } },
        },
      },
    },
  },
  '/docs/openapi.json': {
    get: {
      tags: ['Sistema'],
      operationId: 'verOpenApi',
      summary: 'Especificacion OpenAPI',
      description: 'Documento OpenAPI 3.0 en JSON. Se puede importar en Postman, Insomnia o Swagger UI.',
      responses: {
        200: {
          description: 'Especificacion completa.',
          content: { 'application/json': { schema: { type: 'object' } } },
        },
      },
    },
  },
};
