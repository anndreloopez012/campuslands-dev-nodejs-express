import { ALEATORIO, sustituir, tipoDe } from '../plantilla.js';

const resolver = (nombre) => (nombre === ALEATORIO ? '{{$randomInt 1000 9999}}' : `{{${nombre}}}`);

export function generarHttp(pasos, { baseUrl, titulo }) {
  const lineas = [`@base = ${baseUrl}`];

  for (const paso of pasos) {
    for (const [variable, campo] of Object.entries(paso.guardar ?? {})) {
      lineas.push(`@${variable} = {{${paso.id}.response.body.$.data.${campo}}}`);
    }
  }

  lineas.push('');
  let seccion = null;

  for (const paso of pasos) {
    if (paso.seccion !== seccion) {
      seccion = paso.seccion;
      lineas.push(`### ${seccion.toUpperCase()}`, '');
    }
    lineas.push(`### ${paso.titulo} (espera ${paso.esperado})`);
    lineas.push(`# @name ${paso.id}`);
    lineas.push(`${paso.metodo} {{base}}${sustituir(paso.ruta, resolver)}`);
    const tipo = tipoDe(paso);
    if (tipo) lineas.push(`Content-Type: ${tipo}`);
    if (paso.cuerpo !== undefined) lineas.push('', sustituir(paso.cuerpo, resolver));
    lineas.push('');
  }

  return `# ${titulo}\n${lineas.join('\n')}`;
}
