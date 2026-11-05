import { ALEATORIO, sustituir, tipoDe } from '../plantilla.js';

const resolver = (nombre) => (nombre === ALEATORIO ? '{{$randomInt}}' : `{{${nombre}}}`);

function scriptDe(paso) {
  const lineas = [
    `pm.test('Responde ${paso.esperado}', () => pm.response.to.have.status(${paso.esperado}));`,
  ];
  const guardar = Object.entries(paso.guardar ?? {});
  if (guardar.length) lineas.push('const cuerpo = pm.response.json();');
  for (const [variable, campo] of guardar) {
    lineas.push(`pm.collectionVariables.set('${variable}', cuerpo.data.${campo});`);
  }
  return lineas;
}

function pedidoDe(paso) {
  const tipo = tipoDe(paso);
  const [rutaBase, consulta] = paso.ruta.split('?');
  const pedido = {
    method: paso.metodo,
    header: tipo ? [{ key: 'Content-Type', value: tipo }] : [],
    url: {
      raw: `{{base}}${sustituir(paso.ruta, resolver)}`,
      host: ['{{base}}'],
      path: sustituir(rutaBase, resolver).split('/').filter(Boolean),
    },
  };
  if (consulta) {
    pedido.url.query = consulta.split('&').map((par) => {
      const [key, value] = par.split('=');
      return { key, value };
    });
  }
  if (paso.cuerpo !== undefined) {
    pedido.body = {
      mode: 'raw',
      raw: sustituir(paso.cuerpo, resolver),
      options: { raw: { language: tipo === 'application/json' ? 'json' : 'text' } },
    };
  }
  return pedido;
}

export function generarPostman(pasos, secciones, { baseUrl, titulo }) {
  const carpetas = secciones.map((nombre) => ({
    name: nombre,
    item: pasos
      .filter((paso) => paso.seccion === nombre)
      .map((paso) => ({
        name: `${paso.titulo} (${paso.esperado})`,
        event: [{ listen: 'test', script: { type: 'text/javascript', exec: scriptDe(paso) } }],
        request: pedidoDe(paso),
      })),
  }));

  return JSON.stringify({
    info: {
      name: titulo,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    variable: [{ key: 'base', value: baseUrl }],
    item: carpetas,
  }, null, 2) + '\n';
}
