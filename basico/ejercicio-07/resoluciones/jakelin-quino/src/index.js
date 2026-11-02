const [model, yearText, priceText] = process.argv.slice(2);
const year = Number(yearText);
const price = Number(priceText);

if (!model || !Number.isInteger(year) || year < 1900 || !Number.isFinite(price) || price <= 0) {
  console.error('Uso: npm start -- <modelo> <ano> <precio>');
  console.error('El ano debe ser valido y el precio mayor que cero.');
  process.exitCode = 1;
} else {
  console.log(`Vehiculo: ${model}`);
  console.log(`Ano: ${year}`);
  console.log(`Precio: $${price.toLocaleString('es-CO')}`);
}