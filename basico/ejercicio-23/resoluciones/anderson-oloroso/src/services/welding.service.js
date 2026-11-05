// Almacén en memoria de trabajos de soldadura industrial
let weldingJobs = [
  { id: 1, tipo: 'TIG', material: 'Acero Inoxidable 316', amperaje: 120, espesorMm: 3.5, operador: 'Mario Ruiz', estado: 'Completado' },
  { id: 2, tipo: 'MIG/MAG', material: 'Acero al Carbono A36', amperaje: 180, espesorMm: 6.0, operador: 'Jorge Peña', estado: 'En proceso' }
];

export const getAllJobs = () => weldingJobs;

export const createJob = ({ tipo, material, amperaje, espesorMm, operador }) => {
  const newJob = {
    id: weldingJobs.length > 0 ? Math.max(...weldingJobs.map(j => j.id)) + 1 : 1,
    tipo,
    material,
    amperaje: Number(amperaje),
    espesorMm: Number(espesorMm),
    operador: operador || 'Operador General',
    estado: 'Registrado en Planta'
  };
  weldingJobs.push(newJob);
  return newJob;
};
