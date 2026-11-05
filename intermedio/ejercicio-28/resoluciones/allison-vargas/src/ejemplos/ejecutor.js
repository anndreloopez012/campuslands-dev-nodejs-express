import { ALEATORIO, sustituir, tipoDe } from './plantilla.js';

function leerCampo(cuerpo, campo) {
  const data = cuerpo?.data;
  return data && typeof data === 'object' ? data[campo] : undefined;
}

export async function ejecutar(pasos, enviar, { aleatorio = () => String(1000 + Math.floor(Math.random() * 9000)) } = {}) {
  const variables = {};
  const resultados = [];
  const sufijo = aleatorio();

  const resolver = (nombre) => {
    if (nombre === ALEATORIO) return sufijo;
    if (!Object.hasOwn(variables, nombre)) throw new Error(`Variable sin valor: ${nombre}`);
    return String(variables[nombre]);
  };

  for (const paso of pasos) {
    let ruta = paso.ruta;
    let status = 0;
    let respuesta = null;
    try {
      ruta = sustituir(paso.ruta, resolver);
      const cuerpo = paso.cuerpo === undefined ? undefined : sustituir(paso.cuerpo, resolver);
      ({ status, cuerpo: respuesta } = await enviar({
        metodo: paso.metodo,
        ruta,
        tipo: tipoDe(paso),
        cuerpo,
      }));
    } catch (error) {
      respuesta = { error: error.message };
    }

    for (const [variable, campo] of Object.entries(paso.guardar ?? {})) {
      const valor = leerCampo(respuesta, campo);
      if (valor !== undefined) variables[variable] = valor;
    }

    resultados.push({
      id: paso.id,
      titulo: paso.titulo,
      metodo: paso.metodo,
      ruta,
      esperado: paso.esperado,
      status,
      correcto: status === paso.esperado,
      respuesta,
    });
  }

  return { resultados, variables, correcto: resultados.every((r) => r.correcto) };
}
