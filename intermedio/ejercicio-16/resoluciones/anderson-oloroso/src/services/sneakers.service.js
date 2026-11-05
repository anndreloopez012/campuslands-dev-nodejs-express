const publicDrops = [
  { id: 1, modelo: 'Nike Dunk Low Retro', precioUSD: 115, stock: 45 },
  { id: 2, modelo: 'Adidas Samba Classic', precioUSD: 100, stock: 60 }
];

const vaultExclusives = [
  { id: 101, modelo: 'Travis Scott x Air Jordan 1 Retro Low OG', precioUSD: 1250, paresDisponibles: 3, estado: 'Bóveda Secreta' },
  { id: 102, modelo: 'Nike Mag Back to the Future', precioUSD: 25000, paresDisponibles: 1, estado: 'Bóveda Secreta' }
];

export const getPublicDrops = () => publicDrops;
export const getVaultExclusives = () => vaultExclusives;
