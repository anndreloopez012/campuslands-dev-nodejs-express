// Básico 06: path y rutas seguras (Motos y mecánica)
import { getSafeManualContent } from './services/manual.service.js';

function main() {
  const args = process.argv.slice(2);
  const targetFile = args[0] || 'yamaha-mt09.txt';

  console.log('=== SISTEMA DE CONSULTA SEGURA DE MANUALES DE TALLER ===');
  console.log(`Buscando manual: [${targetFile}]`);

  try {
    const result = getSafeManualContent(targetFile);
    console.log(`\nArchivo: ${result.archivo} (${result.extension})`);
    console.log(`Ruta validada: ${result.rutaSegura}`);
    console.log('\n--- CONTENIDO DEL MANUAL ---');
    console.log(result.contenido);
  } catch (error) {
    console.error(`\n[ERROR DE SEGURIDAD/SISTEMA]: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
