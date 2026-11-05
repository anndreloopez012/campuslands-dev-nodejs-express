export const PROCESOS = {
  mig: { nombre: 'MIG/MAG', eficiencia: 0.8, voltaje: [14, 40], amperaje: [60, 500] },
  tig: { nombre: 'TIG', eficiencia: 0.6, voltaje: [8, 20], amperaje: [10, 300] },
  electrodo: { nombre: 'Electrodo revestido (MMA)', eficiencia: 0.8, voltaje: [18, 40], amperaje: [40, 400] },
  arcosumergido: { nombre: 'Arco sumergido', eficiencia: 1, voltaje: [24, 40], amperaje: [300, 1000] },
};

export const MATERIALES = {
  acero_carbono: { nombre: 'Acero al carbono', limiteKjMm: 3 },
  acero_inoxidable: { nombre: 'Acero inoxidable', limiteKjMm: 1.5 },
  aluminio: { nombre: 'Aluminio', limiteKjMm: 2 },
};

export const CLASIFICACION = { bajoHasta: 0.8, medioHasta: 1.8 };

export const NOMBRES_PROCESOS = Object.keys(PROCESOS);

export const NOMBRES_MATERIALES = Object.keys(MATERIALES);

export const ESTADOS = ['borrador', 'aprobado'];
