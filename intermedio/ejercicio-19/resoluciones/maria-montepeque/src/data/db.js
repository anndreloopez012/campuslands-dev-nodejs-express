// precioBase sin IVA, en la moneda del .env
const disenos = [
    { id: 1, nombre: "Rosa tradicional", estilo: "old school", precioBase: 500 },
    { id: 2, nombre: "Mandala", estilo: "blackwork", precioBase: 900 },
    { id: 3, nombre: "Quetzal", estilo: "realismo", precioBase: 1500 }
];

const citas = [
    { id: 1, disenoId: 2, cliente: "Andrea", fecha: "2026-11-20" }
];

export { disenos, citas };
