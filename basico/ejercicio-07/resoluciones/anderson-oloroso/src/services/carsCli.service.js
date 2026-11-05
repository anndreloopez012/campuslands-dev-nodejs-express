const carsInventory = [
  { marca: 'Ferrari', modelo: 'Roma Spider', motor: 'V8 Twin-Turbo', precioUSD: 275000, maxSpeedKmH: 320 },
  { marca: 'Ferrari', modelo: '296 GTB', motor: 'V6 Hybrid', precioUSD: 342000, maxSpeedKmH: 330 },
  { marca: 'Porsche', modelo: '911 Turbo S', motor: 'Boxer 6 Twin-Turbo', precioUSD: 230000, maxSpeedKmH: 330 },
  { marca: 'Lamborghini', modelo: 'Huracán Tecnica', motor: 'V10 Atmosférico', precioUSD: 285000, maxSpeedKmH: 325 },
  { marca: 'Rolls-Royce', modelo: 'Spectre', motor: 'Eléctrico Dual', precioUSD: 420000, maxSpeedKmH: 250 }
];

export function parseCliArguments(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];
    if (item.startsWith('--')) {
      const key = item.slice(2);
      const nextItem = argv[i + 1];
      if (nextItem && !nextItem.startsWith('--')) {
        flags[key] = nextItem;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return flags;
}

export function searchCars({ brand, minPrice, maxPrice }) {
  let results = [...carsInventory];

  if (brand) {
    results = results.filter((c) => c.marca.toLowerCase() === brand.toLowerCase());
  }

  if (minPrice && !isNaN(Number(minPrice))) {
    results = results.filter((c) => c.precioUSD >= Number(minPrice));
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    results = results.filter((c) => c.precioUSD <= Number(maxPrice));
  }

  return results;
}
