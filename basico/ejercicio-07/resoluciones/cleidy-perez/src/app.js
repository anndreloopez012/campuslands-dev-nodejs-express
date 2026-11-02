function printHelp() { console.log('Uso: node src/app.js [--name="Ariel"] [--level=3] [--help]\nOpciones: --name, --level (1-10), --help'); }
function parseArgs(args) {
  const options = { name: 'Piloto', level: 1, help: false };
  for (const argument of args) {
    if (argument === '--help' || argument === '-h') { options.help = true; continue; }
    if (!argument.startsWith('--')) throw new Error(`Argumento desconocido: ${argument}`);
    const [name, ...rest] = argument.slice(2).split('='); const value = rest.join('=');
    if (!value) throw new Error(`Falta el valor de --${name}`);
    if (name === 'name') options.name = value; else if (name === 'level') options.level = Number(value); else throw new Error(`Opción desconocida: --${name}`);
  }
  if (!Number.isInteger(options.level) || options.level < 1 || options.level > 10) throw new Error('--level debe estar entre 1 y 10');
  if (!options.name.trim()) throw new Error('--name no puede estar vacío');
  return options;
}
function buildCar(options) { return { owner: options.name, model: 'Aurelia GT', level: options.level, status: 'listo para rodar' }; }
function main() { const options = parseArgs(process.argv.slice(2)); if (options.help) return printHelp(); console.log('=== Ejercicio 07: process.argv y CLI ==='); console.log(buildCar(options)); console.log('Ejercicio ejecutado correctamente.'); }
if (require.main === module) { try { main(); } catch (error) { console.error('Error de argumentos:', error.message); printHelp(); process.exitCode = 1; } }
module.exports = { parseArgs, buildCar, printHelp, main };
