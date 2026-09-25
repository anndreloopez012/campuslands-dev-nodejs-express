const [name, characterClass, levelText] = process.argv.slice(2);
const level = Number(levelText);

if (!name || !characterClass || !Number.isInteger(level) || level < 1) {
  console.error('Uso: npm start -- <nombre> <clase> <nivel>');
  console.error('El nivel debe ser un numero entero mayor que cero.');
  process.exitCode = 1;
} else {
  console.log('=== Ficha del aventurero ===');
  console.log(`Nombre: ${name}`);
  console.log(`Clase: ${characterClass}`);
  console.log(`Nivel: ${level}`);
  console.log('Estado: listo para la aventura');
}