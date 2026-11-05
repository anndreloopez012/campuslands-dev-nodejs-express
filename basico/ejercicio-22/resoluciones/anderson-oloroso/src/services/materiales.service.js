// Servicio simple de cálculo de materiales para proyectos de arquitectura 3D
const PRECIOS_MATERIAL = { concreto: 85, acero: 320, madera: 45, vidrio: 120, aluminio: 200 };

export const calcularPresupuesto = ({ largo, ancho, alto, material }) => {
  const mat = material.toLowerCase();
  const precio = PRECIOS_MATERIAL[mat];
  if (!precio) {
    const err = new Error(`Material no reconocido: "${material}". Disponibles: ${Object.keys(PRECIOS_MATERIAL).join(', ')}`);
    err.statusCode = 400;
    throw err;
  }
  const volumenM3 = largo * ancho * alto;
  const costoTotal = volumenM3 * precio;
  return { largo, ancho, alto, material: mat, volumenM3: parseFloat(volumenM3.toFixed(2)), precioPorM3: precio, costoTotalUSD: parseFloat(costoTotal.toFixed(2)) };
};

export const listarMateriales = () => Object.entries(PRECIOS_MATERIAL).map(([nombre, precio]) => ({ material: nombre, precioPorM3: precio }));
