let serviceOrders = [
  {
    idOrden: 'ORD-101',
    cliente: 'Carlos Mendoza',
    placa: 'YAM-99R',
    marca: 'Yamaha',
    modelo: 'MT-09',
    cilindrada: 890,
    kilometraje: 15400,
    tipoServicio: 'preventivo',
    costoEstimadoUSD: 140,
    estado: 'En Progreso',
    fechaIngreso: '2026-10-25T10:30:00Z'
  }
];

export const getOrders = () => serviceOrders;

export const createOrder = (orderData) => {
  const idOrden = `ORD-${serviceOrders.length + 102}`;
  
  let costoEstimadoUSD = 80;
  if (orderData.cilindrada > 600) costoEstimadoUSD += 60;
  if (orderData.tipoServicio === 'correctivo') costoEstimadoUSD += 120;
  if (orderData.tipoServicio === 'afinacion') costoEstimadoUSD += 50;

  const newOrder = {
    idOrden,
    ...orderData,
    costoEstimadoUSD,
    estado: 'Ingresado al Taller',
    fechaIngreso: new Date().toISOString()
  };

  serviceOrders.push(newOrder);
  return newOrder;
};
