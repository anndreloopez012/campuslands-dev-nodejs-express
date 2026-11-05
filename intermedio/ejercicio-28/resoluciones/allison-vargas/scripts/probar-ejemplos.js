import { PASOS } from '../src/ejemplos/catalogo.js';
import { ejecutar } from '../src/ejemplos/ejecutor.js';
import { URL_BASE } from '../src/ejemplos/archivos.js';

const base = (process.argv[2] ?? URL_BASE).replace(/\/$/, '');

async function enviar({ metodo, ruta, tipo, cuerpo }) {
  const respuesta = await fetch(`${base}${ruta}`, {
    method: metodo,
    headers: tipo ? { 'content-type': tipo } : {},
    body: cuerpo,
  });
  const texto = await respuesta.text();
  let datos = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = texto;
  }
  return { status: respuesta.status, cuerpo: datos };
}

try {
  const { resultados, correcto } = await ejecutar(PASOS, enviar);
  for (const r of resultados) {
    console.log(`${r.correcto ? 'OK   ' : 'FALLO'} ${r.metodo.padEnd(6)} ${r.ruta} -> ${r.status} (esperado ${r.esperado})`);
  }
  console.log(correcto ? '\nTodos los ejemplos respondieron como se esperaba' : '\nHay ejemplos que no respondieron como se esperaba');
  process.exit(correcto ? 0 : 1);
} catch (error) {
  console.error(`No se pudo probar contra ${base}: ${error.cause?.code ?? error.message}`);
  process.exit(1);
}
