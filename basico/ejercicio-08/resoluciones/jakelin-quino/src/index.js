const showroom = process.env.SHOWROOM || 'Central Hypercars';
const region = process.env.REGION || 'Bogota';
const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port <= 0) {
  console.error('Error: PORT debe ser un numero entero positivo.');
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ showroom, region, port }, null, 2));
}