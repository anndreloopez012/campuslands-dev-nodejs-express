/**
 * Macros de JSDoc-like para describir la API: cada grupo de endpoints
 * se declara en un lugar unico y /docs + /openapi.json lo publican.
 */
const API_DOCUMENTACION = {
  version: '1.0.0',
  servidor: 'http://localhost:3000',
  grupos: [
    {
      nombre: 'campeones',
      descripcion: 'Catalogo de campeones del MOBA',
      endpoints: [
        {
          metodo: 'GET',
          ruta: '/campeones',
          resumen: 'Lista todos los campeones',
          query: [{ parametro: 'rol', tipo: 'string', requerido: false, valores: ['asesina', 'tanque', 'tirador', 'mago', 'soporte'] }],
          respuestas: [{ codigo: 200, descripcion: 'Lista de campeones' }]
        },
        {
          metodo: 'GET',
          ruta: '/campeones/:id',
          resumen: 'Detalle de un campeon',
          params: [{ parametro: 'id', tipo: 'integer', requerido: true }],
          respuestas: [
            { codigo: 200, descripcion: 'Campeon encontrado' },
            { codigo: 404, descripcion: 'Campeon inexistente' }
          ]
        },
        {
          metodo: 'POST',
          ruta: '/campeones',
          resumen: 'Registra un campeon nuevo',
          body: {
            name: 'string (min 3)',
            rol: 'enum',
            danioBase: 'integer 10-100',
            dificultad: '["baja","media","alta"]'
          },
          respuestas: [
            { codigo: 201, descripcion: 'Campeon creado' },
            { codigo: 400, descripcion: 'ValidationError' }
          ]
        }
      ]
    },
    {
      nombre: 'partidas',
      descripcion: 'Programacion de partidas sobre campanias',
      endpoints: [
        {
          metodo: 'GET',
          ruta: '/partidas',
          resumen: 'Lista las partidas con su campeon abstracto',
          respuestas: [{ codigo: 200, descripcion: 'Lista de partidas' }]
        },
        {
          metodo: 'POST',
          ruta: '/partidas',
          resumen: 'Programa una partida sobre un campeon existente',
          body: {
            campeonId: 'integer (referencial)',
            titulo: 'string (min 3)',
            formato: '["bo1","bo3","bo5"]'
          },
          respuestas: [
            { codigo: 201, descripcion: 'Partida programada' },
            { codigo: 400, descripcion: 'ValidationError' }
          ]
        }
      ]
    }
  ]
};

const FORMATOS_PARTIDA = ['bo1', 'bo3', 'bo5'];

/** Compone el openapi.json publicable sin dependencia de swagger. */
function aOpenapi() {
  const paths = {};

  for (const grupo of API_DOCUMENTACION.grupos) {
    for (const endpoint of grupo.endpoints) {
      const ruta = endpoint.ruta.replace(/:([a-zA-Z]+)/g, '{$1}');
      paths[ruta] = paths[ruta] || {};

      const operacion = {
        summary: endpoint.resumen,
        description: `[grupo: ${grupo.nombre}] ${grupo.descripcion}`,
        tags: [grupo.nombre],
        responses: Object.fromEntries(
          endpoint.respuestas.map((respuesta) => [String(respuesta.codigo), { description: respuesta.descripcion }])
        )
      };

      if (endpoint.params) {
        operacion.parameters = endpoint.params.map((p) => ({
          name: p.parametro, in: 'path', required: !!p.requerido, schema: { type: p.tipo }
        }));
      }
      if (endpoint.body) {
        operacion.requestBody = {
          required: true,
          content: { 'application/json': { example: ejemploDe(endpoint.body) } }
        };
      }

      paths[ruta][endpoint.metodo.toLowerCase()] = operacion;
    }
  }

  return {
    openapi: '3.0.3',
    info: {
      title: 'MOBA Esports API',
      version: API_DOCUMENTACION.version,
      description: 'API de catalogo de campeones y programacion de partidas',
      contact: { name: 'Carlos Velasco' }
    },
    servers: [{ url: API_DOCUMENTACION.servidor }],
    paths
  };
}

function ejemploDe(contrato) {
  const ejemplo = {};
  for (const [campo, tipo] of Object.entries(contrato)) {
    if (tipo.includes('integer')) ejemplo[campo] = 1;
    else if (tipo.includes('string')) ejemplo[campo] = 'EjemploValido';
    else if (tipo.includes('enum') || tipo.includes('[')) ejemplo[campo] = 'baja';
  }
  return ejemplo;
}

module.exports = { API_DOCUMENTACION, FORMATOS_PARTIDA, aOpenapi };
