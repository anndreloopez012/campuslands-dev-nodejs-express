export const ref = (nombre) => ({ $ref: `#/components/schemas/${nombre}` });

export const contenidoJson = (schema, example) => ({
  content: { 'application/json': { schema, example } },
});

export const respuesta = (description, schema, example, headers) => ({
  description,
  ...(headers ? { headers } : {}),
  ...contenidoJson(schema, example),
});

export const errorEjemplo = (message, codigo, errores) => ({
  ok: false,
  message,
  codigo,
  ...(errores ? { errores } : {}),
});

export const respuestaError = (description, message, codigo, errores) =>
  respuesta(description, ref('Error'), errorEjemplo(message, codigo, errores));

export const cuerpoJson = (schema, example, description) => ({
  required: true,
  description,
  ...contenidoJson(schema, example),
});

export const parametroRuta = (name, description, example) => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: { type: 'integer', minimum: 1 },
  example,
});

export const parametroConsulta = (name, description, schema, example) => ({
  name,
  in: 'query',
  required: false,
  description,
  schema,
  ...(example === undefined ? {} : { example }),
});

export const paginacionParametros = [
  { $ref: '#/components/parameters/Pagina' },
  { $ref: '#/components/parameters/Limite' },
];

export const cabeceraTotal = {
  'X-Total-Count': {
    description: 'Cantidad total de resultados antes de paginar.',
    schema: { type: 'integer' },
  },
};

export const cabeceraLocation = (descripcion) => ({
  Location: { description: descripcion, schema: { type: 'string' } },
});
